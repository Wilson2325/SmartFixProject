namespace SmartFix.Api.Models
{
    public class Technician
    {
        public int UserId { get; set; }

        public int DepartmentId { get; set; }

        public bool IsAvailable { get; set; } = true;

        public User? User { get; set; }

        public Department? Department { get; set; }
    }
}