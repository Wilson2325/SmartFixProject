using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Data;
using SmartFix.Api.Models;
using SmartFix.Api.Services;
using System.Security.Claims;

namespace SmartFix.Api.Controllers
{
    [ApiController]
    [Route("api/complaints")]
    [Authorize]
    public class ComplaintsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AssignmentService _assign;
        private readonly EmailService _emailService;

        public ComplaintsController(
            AppDbContext db,
            AssignmentService assign,
            EmailService emailService)
        {
            _db = db;
            _assign = assign;
            _emailService = emailService;
        }

        private int UserId() => int.Parse(User.Claims.First(c => c.Type == "uid").Value);
        private string Role() => User.Claims.First(c => c.Type == ClaimTypes.Role).Value;

        public record CreateComplaintReq(string Title, string Description, string Priority);
        public record ConfirmReq(bool IsFixed, string? Note);

        [Authorize(Roles = "Resident")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateComplaintReq req)
        {
            var residentId = UserId();
            var resident = await _db.Users.FirstOrDefaultAsync(u => u.Id == residentId);

            if (resident == null)
                return BadRequest(new { message = "Resident not found" });

            var deptName = DepartmentClassifier.Classify(req.Title + " " + req.Description);
            var dept = await _db.Departments.FirstOrDefaultAsync(d => d.Name == deptName);

            if (dept == null)
                return BadRequest(new { message = "Department not found" });

            var complaint = new Complaint
            {
                ResidentId = residentId,
                DepartmentId = dept.Id,
                Title = req.Title,
                Description = req.Description,
                Priority = req.Priority,
                Status = "NEW",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Complaints.Add(complaint);
            await _db.SaveChangesAsync();

            var techId = await _assign.PickTechnicianIdAsync(dept.Id);

            if (techId != null)
            {
                complaint.AssignedTechId = techId;
                complaint.Status = "ASSIGNED";
                complaint.UpdatedAt = DateTime.UtcNow;

                _db.ComplaintLogs.Add(new ComplaintLog
                {
                    ComplaintId = complaint.Id,
                    Status = "ASSIGNED",
                    UpdatedBy = residentId,
                    Note = "Auto assigned",
                    UpdatedAt = DateTime.UtcNow
                });

                _db.Notifications.Add(new Notification
                {
                    UserId = techId.Value,
                    Message = $"New complaint assigned: {complaint.Title}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });

                var tech = await _db.Users.FirstOrDefaultAsync(u => u.Id == techId.Value);

                if (tech != null && !string.IsNullOrWhiteSpace(tech.Email))
                {
                    var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:700px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0;color:#2563eb'>New Complaint Assigned</h2>
    <p style='color:#64748b'>A new complaint has been assigned to you.</p>

    <table style='width:100%;border-collapse:collapse;margin-top:20px'>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb;width:180px'><strong>Complaint ID</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>#{complaint.Id}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Title</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Title}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Description</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Description}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Priority</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Priority}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Department</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{dept.Name}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Resident Name</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident.Name}</td></tr>
      <tr><td style='padding:10px'><strong>Room No</strong></td><td style='padding:10px'>{resident.RoomNo ?? "N/A"}</td></tr>
    </table>

    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

                    try
                    {
                        await _emailService.SendEmailAsync(tech.Email, "SmartFix - New Complaint Assigned", html);
                    }
                    catch { }
                }
            }
            else
            {
                complaint.Status = "ESCALATED";
                complaint.UpdatedAt = DateTime.UtcNow;

                _db.ComplaintLogs.Add(new ComplaintLog
                {
                    ComplaintId = complaint.Id,
                    Status = "ESCALATED",
                    UpdatedBy = residentId,
                    Note = "No technician available",
                    UpdatedAt = DateTime.UtcNow
                });

                var owner = await _db.Users.FirstOrDefaultAsync(u => u.Role == "Owner");
                if (owner != null)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = owner.Id,
                        Message = $"Complaint escalated: {complaint.Title}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });

                    if (!string.IsNullOrWhiteSpace(owner.Email))
                    {
                        var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:700px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0;color:#ef4444'>Complaint Escalated</h2>
    <p style='color:#64748b'>No technician was available for this complaint.</p>

    <table style='width:100%;border-collapse:collapse;margin-top:20px'>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb;width:180px'><strong>Complaint ID</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>#{complaint.Id}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Title</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Title}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Description</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Description}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Priority</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Priority}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Resident Name</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident.Name}</td></tr>
      <tr><td style='padding:10px'><strong>Room No</strong></td><td style='padding:10px'>{resident.RoomNo ?? "N/A"}</td></tr>
    </table>

    <p style='margin-top:20px;color:#b91c1c'><strong>Immediate review required.</strong></p>
    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

                        try
                        {
                            await _emailService.SendEmailAsync(owner.Email, "SmartFix - Complaint Escalated", html);
                        }
                        catch { }
                    }
                }
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                complaint.Id,
                complaint.Title,
                complaint.Description,
                complaint.Priority,
                complaint.Status,
                Department = dept.Name,
                complaint.AssignedTechId
            });
        }

        [HttpGet("my")]
        public async Task<IActionResult> My()
        {
            var uid = UserId();
            var role = Role();

            var query = _db.Complaints
                .Include(c => c.Resident)
                .Include(c => c.Department)
                .Include(c => c.AssignedTechnician)
                .AsQueryable();

            if (role == "Resident")
                query = query.Where(c => c.ResidentId == uid);
            else if (role == "Technician")
                query = query.Where(c => c.AssignedTechId == uid);
            else if (role == "Owner")
                query = query.Where(c => c.Status == "ESCALATED");

            var data = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Priority,
                    c.Status,
                    ResidentName = c.Resident.Name,
                    RoomNo = c.Resident.RoomNo,
                    Department = c.Department.Name,
                    TechnicianName = c.AssignedTechnician != null ? c.AssignedTechnician.Name : null,
                    TechnicianEmail = c.AssignedTechnician != null ? c.AssignedTechnician.Email : null,
                    TechnicianPhone = c.AssignedTechnician != null ? c.AssignedTechnician.PhoneNumber : null,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        [Authorize(Roles = "Owner")]
        [HttpGet("escalated")]
        public async Task<IActionResult> Escalated()
        {
            var data = await _db.Complaints
                .Include(c => c.Resident)
                .Include(c => c.Department)
                .Include(c => c.AssignedTechnician)
                .Where(c => c.Status == "ESCALATED")
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Priority,
                    c.Status,
                    ResidentName = c.Resident.Name,
                    RoomNo = c.Resident.RoomNo,
                    Department = c.Department.Name,
                    TechnicianName = c.AssignedTechnician != null ? c.AssignedTechnician.Name : null,
                    TechnicianEmail = c.AssignedTechnician != null ? c.AssignedTechnician.Email : null,
                    TechnicianPhone = c.AssignedTechnician != null ? c.AssignedTechnician.PhoneNumber : null,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        [Authorize(Roles = "Technician")]
        [HttpPost("{id:int}/resolve")]
        public async Task<IActionResult> Resolve(int id)
        {
            var uid = UserId();

            var complaint = await _db.Complaints.FirstOrDefaultAsync(c => c.Id == id && c.AssignedTechId == uid);
            if (complaint == null)
                return NotFound(new { message = "Complaint not found" });

            complaint.Status = "USER_CONFIRM_PENDING";
            complaint.UpdatedAt = DateTime.UtcNow;

            _db.ComplaintLogs.Add(new ComplaintLog
            {
                ComplaintId = complaint.Id,
                Status = "USER_CONFIRM_PENDING",
                UpdatedBy = uid,
                Note = "Marked resolved by technician",
                UpdatedAt = DateTime.UtcNow
            });

            _db.Notifications.Add(new Notification
            {
                UserId = complaint.ResidentId,
                Message = $"Your complaint '{complaint.Title}' has been resolved. Please confirm.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            var resident = await _db.Users.FirstOrDefaultAsync(u => u.Id == complaint.ResidentId);
            if (resident != null && !string.IsNullOrWhiteSpace(resident.Email))
            {
                var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:650px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0;color:#16a34a'>Complaint Resolved</h2>
    <p style='color:#64748b'>A technician has marked your complaint as resolved.</p>

    <table style='width:100%;border-collapse:collapse;margin-top:20px'>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb;width:180px'><strong>Complaint ID</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>#{complaint.Id}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Title</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Title}</td></tr>
      <tr><td style='padding:10px'><strong>Room No</strong></td><td style='padding:10px'>{resident.RoomNo ?? "N/A"}</td></tr>
    </table>

    <p style='margin-top:20px;color:#334155'>Please login to SmartFix and confirm whether the issue is fixed.</p>
    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

                try
                {
                    await _emailService.SendEmailAsync(resident.Email, "SmartFix - Complaint Resolved", html);
                }
                catch { }
            }

            await _db.SaveChangesAsync();
            return Ok(new { complaint.Id, complaint.Status });
        }

        [Authorize(Roles = "Resident")]
        [HttpPost("{id:int}/confirm")]
        public async Task<IActionResult> Confirm(int id, ConfirmReq req)
        {
            var uid = UserId();

            var complaint = await _db.Complaints
                .Include(c => c.AssignedTechnician)
                .FirstOrDefaultAsync(c => c.Id == id && c.ResidentId == uid);

            if (complaint == null)
                return NotFound(new { message = "Complaint not found" });

            var resident = await _db.Users.FirstOrDefaultAsync(u => u.Id == uid);
            var owner = await _db.Users.FirstOrDefaultAsync(x => x.Role == "Owner");
            var tech = complaint.AssignedTechnician;

            if (req.IsFixed)
            {
                complaint.Status = "CLOSED";
                complaint.UpdatedAt = DateTime.UtcNow;

                _db.ComplaintLogs.Add(new ComplaintLog
                {
                    ComplaintId = complaint.Id,
                    Status = "CLOSED",
                    UpdatedBy = uid,
                    Note = req.Note ?? "User confirmed fixed",
                    UpdatedAt = DateTime.UtcNow
                });

                if (owner != null)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = owner.Id,
                        Message = $"Complaint closed: {complaint.Title}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });

                    if (!string.IsNullOrWhiteSpace(owner.Email))
                    {
                        var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:700px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0;color:#22c55e'>Complaint Closed</h2>
    <p style='color:#64748b'>The resident confirmed that the issue is fixed.</p>

    <table style='width:100%;border-collapse:collapse;margin-top:20px'>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb;width:180px'><strong>Complaint ID</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>#{complaint.Id}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Title</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Title}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Resident Name</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident?.Name}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Room No</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident?.RoomNo ?? "N/A"}</td></tr>
      <tr><td style='padding:10px'><strong>Technician Name</strong></td><td style='padding:10px'>{tech?.Name ?? "Not Assigned"}</td></tr>
    </table>

    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

                        try
                        {
                            await _emailService.SendEmailAsync(owner.Email, "SmartFix - Complaint Closed", html);
                        }
                        catch { }
                    }
                }
            }
            else
            {
                complaint.Status = "ESCALATED";
                complaint.UpdatedAt = DateTime.UtcNow;

                _db.ComplaintLogs.Add(new ComplaintLog
                {
                    ComplaintId = complaint.Id,
                    Status = "ESCALATED",
                    UpdatedBy = uid,
                    Note = req.Note ?? "User marked not fixed",
                    UpdatedAt = DateTime.UtcNow
                });

                if (owner != null)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = owner.Id,
                        Message = $"Complaint escalated: {complaint.Title}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });

                    if (!string.IsNullOrWhiteSpace(owner.Email))
                    {
                        var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:720px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0;color:#ef4444'>Complaint Escalated</h2>
    <p style='color:#64748b'>The resident reported that the issue is still not fixed.</p>

    <table style='width:100%;border-collapse:collapse;margin-top:20px'>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb;width:190px'><strong>Complaint ID</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>#{complaint.Id}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Title</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Title}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Description</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Description}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Priority</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{complaint.Priority}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Resident Name</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident?.Name}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Room No</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{resident?.RoomNo ?? "N/A"}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Technician Name</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{tech?.Name ?? "Not Assigned"}</td></tr>
      <tr><td style='padding:10px;border-bottom:1px solid #e5e7eb'><strong>Technician Email</strong></td><td style='padding:10px;border-bottom:1px solid #e5e7eb'>{tech?.Email ?? "N/A"}</td></tr>
      <tr><td style='padding:10px'><strong>Technician Phone</strong></td><td style='padding:10px'>{tech?.PhoneNumber ?? "N/A"}</td></tr>
    </table>

    <div style='margin-top:20px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px'>
      <p style='margin:0;color:#b91c1c'><strong>Immediate action required.</strong></p>
    </div>

    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

                        try
                        {
                            await _emailService.SendEmailAsync(owner.Email, "SmartFix - Complaint Escalated", html);
                        }
                        catch { }
                    }
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { complaint.Id, complaint.Status });
        }
    }
}