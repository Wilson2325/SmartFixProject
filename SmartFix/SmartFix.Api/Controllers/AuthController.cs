using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartFix.Api.Data;
using SmartFix.Api.Models;
using SmartFix.Api.Services;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartFix.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _cfg;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext db, IConfiguration cfg, EmailService emailService)
        {
            _db = db;
            _cfg = cfg;
            _emailService = emailService;
        }

        public class RegisterReq
        {
            [Required]
            public string Name { get; set; } = "";

            [Required, EmailAddress]
            public string Email { get; set; } = "";

            [Required, MinLength(6)]
            public string Password { get; set; } = "";

            [Required]
            public string Role { get; set; } = "";

            public string? RoomNo { get; set; }

            public int? DepartmentId { get; set; }

            [Required]
            public string PhoneNumber { get; set; } = "";
        }

        public class LoginReq
        {
            [Required, EmailAddress]
            public string Email { get; set; } = "";

            [Required]
            public string Password { get; set; } = "";
        }

        public class VerifyOtpReq
        {
            [Required, EmailAddress]
            public string Email { get; set; } = "";

            [Required]
            public string OtpCode { get; set; } = "";
        }

        public class ForgotPasswordReq
        {
            [Required, EmailAddress]
            public string Email { get; set; } = "";
        }

        public class ResetPasswordReq
        {
            [Required, EmailAddress]
            public string Email { get; set; } = "";

            [Required]
            public string OtpCode { get; set; } = "";

            [Required, MinLength(6)]
            public string NewPassword { get; set; } = "";
        }

        [HttpGet("check-owner")]
        public async Task<IActionResult> CheckOwner()
        {
            var exists = await _db.Users.AnyAsync(u => u.Role == "Owner");
            return Ok(new { exists });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterReq req)
        {
            var validRoles = new[] { "Resident", "Technician", "Owner" };
            if (!validRoles.Contains(req.Role))
                return BadRequest(new { message = "Invalid role" });

            var email = req.Email.Trim().ToLower();

            if (await _db.Users.AnyAsync(x => x.Email == email))
                return BadRequest(new { message = "Email already exists" });

            if (req.Role == "Owner")
            {
                var ownerExists = await _db.Users.AnyAsync(u => u.Role == "Owner");
                if (ownerExists)
                    return BadRequest(new { message = "Owner already exists. Only one owner allowed." });
            }

            if (req.Role == "Technician")
            {
                if (req.DepartmentId == null)
                    return BadRequest(new { message = "DepartmentId is required for technician registration" });

                var departmentExists = await _db.Departments.AnyAsync(d => d.Id == req.DepartmentId.Value);
                if (!departmentExists)
                    return BadRequest(new { message = "Invalid DepartmentId" });
            }

            if (req.Role == "Resident" && string.IsNullOrWhiteSpace(req.RoomNo))
                return BadRequest(new { message = "RoomNo is required for resident registration" });

            var user = new User
            {
                Name = req.Name.Trim(),
                Email = email,
                Role = req.Role,
                RoomNo = string.IsNullOrWhiteSpace(req.RoomNo) ? null : req.RoomNo.Trim(),
                PhoneNumber = req.PhoneNumber.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                IsActive = true,
                IsVerified = false
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            if (req.Role == "Technician")
            {
                var technician = new Technician
                {
                    UserId = user.Id,
                    DepartmentId = req.DepartmentId!.Value,
                    IsAvailable = true
                };

                _db.Technicians.Add(technician);
                await _db.SaveChangesAsync();
            }

            var otp = new Random().Next(100000, 999999).ToString();

            var otpEntry = new OtpVerification
            {
                UserId = user.Id,
                Email = user.Email,
                OtpCode = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.OtpVerifications.Add(otpEntry);
            await _db.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(user.Email, otp);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to send OTP email",
                    error = ex.Message,
                    demoOtp = otp
                });
            }

            return Ok(new { message = "OTP sent to your email successfully" });
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ForgotPasswordReq req)
        {
            var email = req.Email.Trim().ToLower();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var otp = new Random().Next(100000, 999999).ToString();

            var otpEntry = new OtpVerification
            {
                UserId = user.Id,
                Email = email,
                OtpCode = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.OtpVerifications.Add(otpEntry);
            await _db.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(email, otp);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to resend OTP email",
                    error = ex.Message,
                    demoOtp = otp
                });
            }

            return Ok(new { message = "OTP resent successfully" });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpReq req)
        {
            var email = req.Email.Trim().ToLower();

            var otpEntry = await _db.OtpVerifications
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync(o =>
                    o.Email == email &&
                    o.OtpCode == req.OtpCode &&
                    !o.IsUsed);

            if (otpEntry == null)
                return BadRequest(new { message = "Invalid OTP" });

            if (otpEntry.ExpiryTime < DateTime.UtcNow)
                return BadRequest(new { message = "OTP expired" });

            otpEntry.IsUsed = true;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == otpEntry.UserId);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            user.IsVerified = true;
            await _db.SaveChangesAsync();

            return Ok(new { message = "OTP verified successfully" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordReq req)
        {
            var email = req.Email.Trim().ToLower();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var otp = new Random().Next(100000, 999999).ToString();

            var otpEntry = new OtpVerification
            {
                UserId = user.Id,
                Email = email,
                OtpCode = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.OtpVerifications.Add(otpEntry);
            await _db.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(email, otp);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to send reset OTP email",
                    error = ex.Message,
                    demoOtp = otp
                });
            }

            return Ok(new { message = "Password reset OTP sent to email" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordReq req)
        {
            var email = req.Email.Trim().ToLower();

            var otpEntry = await _db.OtpVerifications
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync(o =>
                    o.Email == email &&
                    o.OtpCode == req.OtpCode &&
                    !o.IsUsed);

            if (otpEntry == null)
                return BadRequest(new { message = "Invalid OTP" });

            if (otpEntry.ExpiryTime < DateTime.UtcNow)
                return BadRequest(new { message = "OTP expired" });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == otpEntry.UserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            otpEntry.IsUsed = true;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginReq req)
        {
            var email = req.Email.Trim().ToLower();

            var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var passwordOk = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            if (!passwordOk)
                return Unauthorized(new { message = "Invalid email or password" });

            if (!user.IsVerified)
                return Unauthorized(new { message = "Please verify email OTP before login" });

            var token = CreateToken(user.Id, user.Email, user.Role, user.Name);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role,
                    user.RoomNo,
                    user.PhoneNumber
                }
            });
        }

        private string CreateToken(int id, string email, string role, string name)
        {
            var jwtKey = _cfg["Jwt:Key"] ?? throw new Exception("Jwt:Key missing in appsettings.json");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim("uid", id.ToString()),
                new Claim(ClaimTypes.Role, role),
                new Claim("name", name)
            };

            var token = new JwtSecurityToken(
                issuer: _cfg["Jwt:Issuer"],
                audience: _cfg["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}