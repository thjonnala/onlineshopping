using HyderabadOnlineShopping.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HyderabadOnlineShopping.API.Data;

// Schema for this app lives in the shared ThiruApps database repo
// (../thiru-apps-db/hos/init.sql). All objects use the "hos_" prefix so the
// app can share one PostgreSQL database with other apps. This context only
// MAPS to those tables — it does not create or migrate them.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Cart => Set<Cart>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map every entity to its hos_-prefixed table in the shared database.
        modelBuilder.Entity<User>().ToTable("hos_Users");
        modelBuilder.Entity<Category>().ToTable("hos_Categories");
        modelBuilder.Entity<Product>().ToTable("hos_Products");
        modelBuilder.Entity<Cart>().ToTable("hos_Cart");
        modelBuilder.Entity<Order>().ToTable("hos_Orders");
        modelBuilder.Entity<OrderItem>().ToTable("hos_OrderItems");

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // CreatedAt is filled by the database default (now()); EF omits it on insert.
        modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        modelBuilder.Entity<Product>().Property(p => p.CreatedAt).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        modelBuilder.Entity<Cart>().Property(c => c.CreatedAt).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        modelBuilder.Entity<Order>().Property(o => o.CreatedAt).HasDefaultValueSql("now()").ValueGeneratedOnAdd();

        modelBuilder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(p => p.DiscountPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasPrecision(18, 2);
    }
}
