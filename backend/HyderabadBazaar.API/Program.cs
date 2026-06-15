using System.Text;
using HyderabadOnlineShopping.API.Data;
using HyderabadOnlineShopping.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Render (and most PaaS) inject the port to listen on via the PORT env var.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        o.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hyderabad Online Shopping API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// Database — PostgreSQL (Neon).
// Render/Neon provide the connection string via the DATABASE_URL env var.
// Locally, falls back to the DefaultConnection in appsettings.json.
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

// Neon/Render often supply a URI-style string (postgres://user:pass@host/db).
// Npgsql needs key=value form, so convert if needed.
connectionString = NormalizePostgresConnectionString(connectionString!);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();

// CORS — allow all origins in Production (public API), restrict locally
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        if (builder.Environment.IsProduction())
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(
                      "http://localhost:3000", "http://localhost:5173", "https://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Schema is owned by the shared ThiruApps DB repo (../thiru-apps-db/hos/init.sql),
// not by this app. Apply it once with that repo's apply.ps1 before first run.

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("ReactApp");
// No UseHttpsRedirection — Render/PaaS terminates TLS at the edge and
// forwards plain HTTP to the container; redirecting here causes loops.
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// DB-independent health check for Render — returns 200 even if the database
// isn't reachable yet, so deploys don't fail before DATABASE_URL is set.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

// Converts a postgres:// URI (as Neon/Render expose) into the key=value
// form Npgsql expects. Passes through strings that are already key=value.
static string NormalizePostgresConnectionString(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;
    if (!raw.StartsWith("postgres://") && !raw.StartsWith("postgresql://"))
        return raw; // already in key=value form

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);
    var db = uri.AbsolutePath.TrimStart('/');
    var port = uri.Port > 0 ? uri.Port : 5432;

    var builder = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = port,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
        Database = db,
        // Prefer: uses SSL when the server offers it (Neon), falls back to
        // plaintext for local servers without SSL. Works in both environments.
        SslMode = Npgsql.SslMode.Prefer
    };
    return builder.ToString();
}
