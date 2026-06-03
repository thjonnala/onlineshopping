namespace HyderabadOnlineShopping.API.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public int CategoryId { get; set; }
    public double Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<Cart> CartItems { get; set; } = new List<Cart>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
