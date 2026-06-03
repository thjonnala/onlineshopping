using HyderabadBazaar.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HyderabadBazaar.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Categories.Where(c => c.IsActive).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await db.Categories.FindAsync(id);
        return category == null ? NotFound() : Ok(category);
    }
}
