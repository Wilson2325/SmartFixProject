using Microsoft.EntityFrameworkCore;
using SmartFix.Api.Models;

namespace SmartFix.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<Complaint> Complaints => Set<Complaint>();
        public DbSet<ComplaintLog> ComplaintLogs => Set<ComplaintLog>();
        public DbSet<OtpVerification> OtpVerifications => Set<OtpVerification>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Technician>()
                .HasKey(t => t.UserId);

            modelBuilder.Entity<Technician>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Technician>()
                .HasOne(t => t.Department)
                .WithMany()
                .HasForeignKey(t => t.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Resident)
                .WithMany()
                .HasForeignKey(c => c.ResidentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Department)
                .WithMany()
                .HasForeignKey(c => c.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.AssignedTechnician)
                .WithMany()
                .HasForeignKey(c => c.AssignedTechId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ComplaintLog>()
                .HasOne(cl => cl.Complaint)
                .WithMany()
                .HasForeignKey(cl => cl.ComplaintId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OtpVerification>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Electrician" },
                new Department { Id = 2, Name = "Plumber" },
                new Department { Id = 3, Name = "Carpenter" },
                new Department { Id = 4, Name = "Water" },
                new Department { Id = 5, Name = "General" }
            );
        }
    }
}