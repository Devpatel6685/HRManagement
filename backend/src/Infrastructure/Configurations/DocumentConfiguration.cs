using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DocType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.FileName).IsRequired().HasMaxLength(255);
        builder.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
        builder.Property(e => e.FileSize).IsRequired();

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.Documents)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.UploadedBy)
               .WithMany()
               .HasForeignKey(e => e.UploadedById)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
