using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Data;
using SmartFix.Api.Helpers;

namespace SmartFix.Api.Services
{
    public class AssignmentService
    {
        private readonly AppDbContext _db;

        public AssignmentService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<int?> PickTechnicianIdAsync(int departmentId)
        {
            var techIds = await _db.Technicians
                .Where(t => t.DepartmentId == departmentId && t.IsAvailable)
                .Select(t => t.UserId)
                .ToListAsync();

            if (techIds.Count == 0)
                return null;

            int? bestTechId = null;
            int bestCount = int.MaxValue;

            foreach (var techId in techIds)
            {
                var activeCount = await _db.Complaints.CountAsync(c =>
                    c.AssignedTechId == techId &&
                    (c.Status == ComplaintStatuses.Assigned ||
                     c.Status == ComplaintStatuses.InProgress ||
                     c.Status == ComplaintStatuses.UserConfirmPending));

                if (activeCount < bestCount)
                {
                    bestCount = activeCount;
                    bestTechId = techId;
                }
            }

            return bestTechId;
        }
    }
}