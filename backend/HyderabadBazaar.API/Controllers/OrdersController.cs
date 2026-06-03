using System.Security.Claims;
using HyderabadBazaar.API.Data;
using HyderabadBazaar.API.DTOs;
using HyderabadBazaar.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HyderabadBazaar.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(AppDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == UserId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                ShippingAddress = o.ShippingAddress,
                PaymentMethod = o.PaymentMethod,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    ProductImage = oi.Product.ImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (order == null) return NotFound();

        return Ok(new OrderDto
        {
            Id = order.Id,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            ShippingAddress = order.ShippingAddress,
            PaymentMethod = order.PaymentMethod,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                ProductImage = oi.Product.ImageUrl,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
    {
        var cartItems = await db.Cart
            .Include(c => c.Product)
            .Where(c => c.UserId == UserId)
            .ToListAsync();

        if (cartItems.Count == 0)
            return BadRequest(new { message = "Cart is empty." });

        foreach (var item in cartItems)
        {
            if (item.Product.Stock < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {item.Product.Name}." });
        }

        var order = new Order
        {
            UserId = UserId,
            ShippingAddress = dto.ShippingAddress,
            PaymentMethod = dto.PaymentMethod,
            TotalAmount = cartItems.Sum(c => (c.Product.DiscountPrice ?? c.Product.Price) * c.Quantity),
            Status = "Confirmed",
            OrderItems = cartItems.Select(c => new OrderItem
            {
                ProductId = c.ProductId,
                Quantity = c.Quantity,
                UnitPrice = c.Product.DiscountPrice ?? c.Product.Price
            }).ToList()
        };

        foreach (var item in cartItems)
            item.Product.Stock -= item.Quantity;

        db.Orders.Add(order);
        db.Cart.RemoveRange(cartItems);
        await db.SaveChangesAsync();

        return Ok(new { orderId = order.Id, message = "Order placed successfully!" });
    }
}
