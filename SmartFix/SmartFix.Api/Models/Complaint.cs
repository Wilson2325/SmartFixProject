namespace SmartFix.Api.Models
{
    public class Complaint
    {
        public int Id { get; set; }

        public int ResidentId { get; set; }

        public int DepartmentId { get; set; }

        public int? AssignedTechId { get; set; }

        public string Title { get; set; } = "";

        public string Description { get; set; } = "";

        public string Priority { get; set; } = "Medium";

        public string Status { get; set; } = "NEW";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User? Resident { get; set; }

        public Department? Department { get; set; }

        public User? AssignedTechnician { get; set; }
    }
}