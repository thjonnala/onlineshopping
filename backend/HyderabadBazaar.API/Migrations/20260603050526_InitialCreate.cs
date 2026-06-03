using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HyderabadBazaar.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    ReviewCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cart_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cart_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "ImageUrl", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "Authentic Hyderabadi biryani masalas and spices", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", true, "Biryani Spices" },
                    { 2, "Famous Hyderabadi pearls and traditional jewellery", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", true, "Pearls & Jewellery" },
                    { 3, "Bidriware, Nirmal paintings and local handicrafts", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", true, "Handicrafts" },
                    { 4, "Pochampally Ikat, Gadwal sarees and Hyderabadi fabrics", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", true, "Textiles & Ikat" },
                    { 5, "Latest gadgets and electronics from Hyderabad tech hub", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", true, "Electronics" },
                    { 6, "Double ka meetha, Qubani ka meetha and traditional sweets", "https://images.unsplash.com/photo-1571167530149-c1105da4f3b9?w=400", true, "Hyderabadi Sweets" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "DiscountPrice", "ImageUrl", "IsActive", "Name", "Price", "Rating", "ReviewCount", "Stock" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Authentic Hyderabadi biryani masala blend from the legendary Shah Ghouse restaurant recipe. Perfect spice mix for dum biryani.", 249m, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", true, "Shah Ghouse Biryani Masala", 299m, 4.7999999999999998, 1245, 150 },
                    { 2, 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Complete spice kit from Pista House — Hyderabad's iconic biryani chain. Includes whole spices and masala blend.", 389m, "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400", true, "Pista House Biryani Spice Kit", 450m, 4.7000000000000002, 876, 80 },
                    { 3, 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ready-mix for the famous Mirchi ka Salan — the traditional accompaniment to Hyderabadi biryani.", 149m, "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", true, "Hyderbadi Mirchi ka Salan Mix", 180m, 4.5999999999999996, 532, 200 },
                    { 4, 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pure Kashmiri saffron, essential for authentic Hyderabadi biryani color and aroma. 2g pack.", 520m, "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400", true, "Saffron (Kesar) Premium Grade", 599m, 4.9000000000000004, 2103, 60 },
                    { 5, 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic freshwater pearl necklace set with matching earrings. Sourced from Hyderabad's famous Laad Bazaar.", 3999m, "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", true, "Hyderabadi Pearl Necklace Set", 4500m, 4.7000000000000002, 341, 25 },
                    { 6, 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Handcrafted Kundan choker with meenakari work — traditional Hyderabadi jewellery art form.", 7200m, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", true, "Kundan Choker Necklace", 8500m, 4.7999999999999998, 189, 15 },
                    { 7, 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Certified South Sea pearl studs, hand-picked from Hyderabad's Mangatrai Pearls collection.", 1899m, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", true, "South Sea Pearl Stud Earrings", 2200m, 4.5999999999999996, 467, 40 },
                    { 8, 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Authentic Bidar silver inlay work vase — UNESCO-recognized craft. Each piece unique and handmade.", 2499m, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", true, "Bidriware Flower Vase", 2800m, 4.9000000000000004, 213, 20 },
                    { 9, 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hand-painted Nirmal toy-style decorative box with traditional Telangana folk art motifs.", 999m, "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400", true, "Nirmal Lacquerware Wooden Box", 1200m, 4.5, 178, 35 },
                    { 10, 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Large hand-painted Kalamkari fabric art with Charminar motif — pen-and-ink technique on cotton.", 1499m, "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400", true, "Kalamkari Wall Hanging", 1800m, 4.7000000000000002, 295, 30 },
                    { 11, 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pure silk Pochampally Ikat saree with traditional geometric patterns from Bhoodan Pochampally village.", 9999m, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", true, "Pochampally Ikat Silk Saree", 12000m, 4.7999999999999998, 156, 15 },
                    { 12, 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Traditional Gadwal saree with pure zari border — lightweight for summer wear.", 5499m, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400", true, "Gadwal Cotton Silk Saree", 6500m, 4.5999999999999996, 234, 22 },
                    { 13, 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Handwoven khadi cotton kurta-pajama set with chikan embroidery — comfort meets heritage.", 1799m, "https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400", true, "Hyderabadi Khadi Kurta Set", 2200m, 4.4000000000000004, 412, 50 },
                    { 14, 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Wireless Bluetooth headphones with 15hr battery. Popular choice in Hyderabad tech stores.", 1499m, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", true, "boAt Rockerz 450 Headphones", 1999m, 4.2999999999999998, 8923, 120 },
                    { 15, 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "5G smartphone with 200MP camera. Best seller at Hyderabad's SP Road electronics market.", 23999m, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", true, "Redmi Note 13 Pro", 26999m, 4.4000000000000004, 5634, 75 },
                    { 16, 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Intel Core i5, 16GB RAM, 512GB SSD. Popular at Hyderabad's HITECH City offices.", 57999m, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", true, "HP Pavilion Laptop 15", 62990m, 4.5, 2341, 30 },
                    { 17, 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Iconic Karachi Bakery fruit biscuits — Hyderabad's most famous bakery since 1953. 400g pack.", 285m, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", true, "Karachi Bakery Fruit Biscuits", 320m, 4.7999999999999998, 15234, 200 },
                    { 18, 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ready-to-make mix for Hyderabad's beloved bread pudding dessert — Double Ka Meetha.", 169m, "https://images.unsplash.com/photo-1571167530149-c1105da4f3b9?w=400", true, "Double Ka Meetha Mix", 199m, 4.5, 723, 180 },
                    { 19, 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Premium dried apricot dessert mix — a classic Hyderabadi wedding sweet. 500g pack.", 399m, "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400", true, "Qubani Ka Meetha (Apricot Dessert)", 450m, 4.7000000000000002, 445, 90 },
                    { 20, 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Authentic slow-cooked haleem spice and grain mix, inspired by Pista House's award-winning recipe.", 329m, "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400", true, "Haleem Mix (Pista House Style)", 380m, 4.9000000000000004, 3201, 140 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cart_ProductId",
                table: "Cart",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_UserId",
                table: "Cart",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId",
                table: "OrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
