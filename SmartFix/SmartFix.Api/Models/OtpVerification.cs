namespace SmartFix.Api.Models
{
    public class OtpVerification
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Email { get; set; } = "";

        public string OtpCode { get; set; } = "";

        public DateTime ExpiryTime { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}