using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class PerformanceReviewConfiguration : IEntityTypeConfiguration<PerformanceReview>
{
    public void Configure(EntityTypeBuilder<PerformanceReview> builder)
    {
        builder.ToTable("PerformanceReviews");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Period).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Comments).HasMaxLength(1000);

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.PerformanceReviews)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Reviewer)
               .WithMany(emp => emp.ReviewsGiven)
               .HasForeignKey(e => e.ReviewerId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
