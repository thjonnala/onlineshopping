using System.ComponentModel.DataAnnotations;

namespace HyderabadBazaar.API.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int Quantity { get; set; }
    public int Stock { get; set; }
}

public class AddToCartDto
{
    [Required] public int ProductId { get; set; }
    [Required, Range(1, 100)] public int Quantity { get; set; }
}

public class UpdateCartDto
{
    [Required, Range(1, 100)] public int Quantity { get; set; }
}
