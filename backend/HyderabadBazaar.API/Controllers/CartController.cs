using System.Security.Claims;
using HyderabadOnlineShopping.API.Data;
using HyderabadOnlineShopping.API.DTOs;
using HyderabadOnlineShopping.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HyderabadOnlineShopping.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var items = await db.Cart
            .Include(c => c.Product)
            .Where(c => c.UserId == UserId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                ProductImage = c.Product.ImageUrl,
                Price = c.Product.Price,
                DiscountPrice = c.Product.DiscountPrice,
                Quantity = c.Quantity,
                Stock = c.Product.Stock
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var product = await db.Products.FindAsync(dto.ProductId);
        if (product == null || !product.IsActive) return NotFound(new { message = "Product not found." });
        if (product.Stock < dto.Quantity) return BadRequest(new { message = "Insufficient stock." });

        var existing = await db.Cart.FirstOrDefaultAsync(c => c.UserId == UserId && c.ProductId == dto.ProductId);
        if (existing != null)
        {
            existing.Quantity += dto.Quantity;
        }
        else
        {
            db.Cart.Add(new Cart { UserId = UserId, ProductId = dto.ProductId, Quantity = dto.Quantity });
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Added to cart." });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCart(int id, UpdateCartDto dto)
    {
        var item = await db.Cart.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (item == null) return NotFound();

        item.Quantity = dto.Quantity;
        await db.SaveChangesAsync();
        return Ok(new { message = "Cart updated." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        var item = await db.Cart.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (item == null) return NotFound();

        db.Cart.Remove(item);
        await db.SaveChangesAsync();
        return Ok(new { message = "Removed from cart." });
    }
}
