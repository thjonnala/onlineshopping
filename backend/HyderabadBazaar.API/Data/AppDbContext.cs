using HyderabadBazaar.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HyderabadBazaar.API.Data;

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

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        modelBuilder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(p => p.DiscountPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Product>().Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        modelBuilder.Entity<Cart>().Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<Order>().Property(o => o.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        modelBuilder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasPrecision(18, 2);

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Biryani Spices", Description = "Authentic Hyderabadi biryani masalas and spices", ImageUrl = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", IsActive = true },
            new Category { Id = 2, Name = "Pearls & Jewellery", Description = "Famous Hyderabadi pearls and traditional jewellery", ImageUrl = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", IsActive = true },
            new Category { Id = 3, Name = "Handicrafts", Description = "Bidriware, Nirmal paintings and local handicrafts", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", IsActive = true },
            new Category { Id = 4, Name = "Textiles & Ikat", Description = "Pochampally Ikat, Gadwal sarees and Hyderabadi fabrics", ImageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", IsActive = true },
            new Category { Id = 5, Name = "Electronics", Description = "Latest gadgets and electronics from Hyderabad tech hub", ImageUrl = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", IsActive = true },
            new Category { Id = 6, Name = "Hyderabadi Sweets", Description = "Double ka meetha, Qubani ka meetha and traditional sweets", ImageUrl = "https://images.unsplash.com/photo-1571167530149-c1105da4f3b9?w=400", IsActive = true }
        );

        modelBuilder.Entity<Product>().HasData(
            // Biryani Spices
            new Product { Id = 1, Name = "Shah Ghouse Biryani Masala", Description = "Authentic Hyderabadi biryani masala blend from the legendary Shah Ghouse restaurant recipe. Perfect spice mix for dum biryani.", Price = 299, DiscountPrice = 249, Stock = 150, CategoryId = 1, Rating = 4.8, ReviewCount = 1245, ImageUrl = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2, Name = "Pista House Biryani Spice Kit", Description = "Complete spice kit from Pista House — Hyderabad's iconic biryani chain. Includes whole spices and masala blend.", Price = 450, DiscountPrice = 389, Stock = 80, CategoryId = 1, Rating = 4.7, ReviewCount = 876, ImageUrl = "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 3, Name = "Hyderbadi Mirchi ka Salan Mix", Description = "Ready-mix for the famous Mirchi ka Salan — the traditional accompaniment to Hyderabadi biryani.", Price = 180, DiscountPrice = 149, Stock = 200, CategoryId = 1, Rating = 4.6, ReviewCount = 532, ImageUrl = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 4, Name = "Saffron (Kesar) Premium Grade", Description = "Pure Kashmiri saffron, essential for authentic Hyderabadi biryani color and aroma. 2g pack.", Price = 599, DiscountPrice = 520, Stock = 60, CategoryId = 1, Rating = 4.9, ReviewCount = 2103, ImageUrl = "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Pearls & Jewellery
            new Product { Id = 5, Name = "Hyderabadi Pearl Necklace Set", Description = "Classic freshwater pearl necklace set with matching earrings. Sourced from Hyderabad's famous Laad Bazaar.", Price = 4500, DiscountPrice = 3999, Stock = 25, CategoryId = 2, Rating = 4.7, ReviewCount = 341, ImageUrl = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 6, Name = "Kundan Choker Necklace", Description = "Handcrafted Kundan choker with meenakari work — traditional Hyderabadi jewellery art form.", Price = 8500, DiscountPrice = 7200, Stock = 15, CategoryId = 2, Rating = 4.8, ReviewCount = 189, ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 7, Name = "South Sea Pearl Stud Earrings", Description = "Certified South Sea pearl studs, hand-picked from Hyderabad's Mangatrai Pearls collection.", Price = 2200, DiscountPrice = 1899, Stock = 40, CategoryId = 2, Rating = 4.6, ReviewCount = 467, ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Handicrafts
            new Product { Id = 8, Name = "Bidriware Flower Vase", Description = "Authentic Bidar silver inlay work vase — UNESCO-recognized craft. Each piece unique and handmade.", Price = 2800, DiscountPrice = 2499, Stock = 20, CategoryId = 3, Rating = 4.9, ReviewCount = 213, ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 9, Name = "Nirmal Lacquerware Wooden Box", Description = "Hand-painted Nirmal toy-style decorative box with traditional Telangana folk art motifs.", Price = 1200, DiscountPrice = 999, Stock = 35, CategoryId = 3, Rating = 4.5, ReviewCount = 178, ImageUrl = "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 10, Name = "Kalamkari Wall Hanging", Description = "Large hand-painted Kalamkari fabric art with Charminar motif — pen-and-ink technique on cotton.", Price = 1800, DiscountPrice = 1499, Stock = 30, CategoryId = 3, Rating = 4.7, ReviewCount = 295, ImageUrl = "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Textiles
            new Product { Id = 11, Name = "Pochampally Ikat Silk Saree", Description = "Pure silk Pochampally Ikat saree with traditional geometric patterns from Bhoodan Pochampally village.", Price = 12000, DiscountPrice = 9999, Stock = 15, CategoryId = 4, Rating = 4.8, ReviewCount = 156, ImageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 12, Name = "Gadwal Cotton Silk Saree", Description = "Traditional Gadwal saree with pure zari border — lightweight for summer wear.", Price = 6500, DiscountPrice = 5499, Stock = 22, CategoryId = 4, Rating = 4.6, ReviewCount = 234, ImageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 13, Name = "Hyderabadi Khadi Kurta Set", Description = "Handwoven khadi cotton kurta-pajama set with chikan embroidery — comfort meets heritage.", Price = 2200, DiscountPrice = 1799, Stock = 50, CategoryId = 4, Rating = 4.4, ReviewCount = 412, ImageUrl = "https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Electronics
            new Product { Id = 14, Name = "boAt Rockerz 450 Headphones", Description = "Wireless Bluetooth headphones with 15hr battery. Popular choice in Hyderabad tech stores.", Price = 1999, DiscountPrice = 1499, Stock = 120, CategoryId = 5, Rating = 4.3, ReviewCount = 8923, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 15, Name = "Redmi Note 13 Pro", Description = "5G smartphone with 200MP camera. Best seller at Hyderabad's SP Road electronics market.", Price = 26999, DiscountPrice = 23999, Stock = 75, CategoryId = 5, Rating = 4.4, ReviewCount = 5634, ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 16, Name = "HP Pavilion Laptop 15", Description = "Intel Core i5, 16GB RAM, 512GB SSD. Popular at Hyderabad's HITECH City offices.", Price = 62990, DiscountPrice = 57999, Stock = 30, CategoryId = 5, Rating = 4.5, ReviewCount = 2341, ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Hyderabadi Sweets
            new Product { Id = 17, Name = "Karachi Bakery Fruit Biscuits", Description = "Iconic Karachi Bakery fruit biscuits — Hyderabad's most famous bakery since 1953. 400g pack.", Price = 320, DiscountPrice = 285, Stock = 200, CategoryId = 6, Rating = 4.8, ReviewCount = 15234, ImageUrl = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 18, Name = "Double Ka Meetha Mix", Description = "Ready-to-make mix for Hyderabad's beloved bread pudding dessert — Double Ka Meetha.", Price = 199, DiscountPrice = 169, Stock = 180, CategoryId = 6, Rating = 4.5, ReviewCount = 723, ImageUrl = "https://images.unsplash.com/photo-1571167530149-c1105da4f3b9?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 19, Name = "Qubani Ka Meetha (Apricot Dessert)", Description = "Premium dried apricot dessert mix — a classic Hyderabadi wedding sweet. 500g pack.", Price = 450, DiscountPrice = 399, Stock = 90, CategoryId = 6, Rating = 4.7, ReviewCount = 445, ImageUrl = "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 20, Name = "Haleem Mix (Pista House Style)", Description = "Authentic slow-cooked haleem spice and grain mix, inspired by Pista House's award-winning recipe.", Price = 380, DiscountPrice = 329, Stock = 140, CategoryId = 6, Rating = 4.9, ReviewCount = 3201, ImageUrl = "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
