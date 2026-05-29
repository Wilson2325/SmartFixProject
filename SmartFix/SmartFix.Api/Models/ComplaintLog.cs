namespace SmartFix.Api.Models
{
    public class ComplaintLog
    {
        public int Id { get; set; }

        public int ComplaintId { get; set; }

        public string Status { get; set; } = "";

        public string? Note { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Complaint? Complaint { get; set; }
    }
}