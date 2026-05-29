using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Data;

namespace SmartFix.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Owner")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _db.Users
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    email = u.Email,
                    role = u.Role,
                    roomNo = u.RoomNo,
                    phoneNumber = u.PhoneNumber
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}