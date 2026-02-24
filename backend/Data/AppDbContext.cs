using Microsoft.EntityFrameworkCore;
using StepMoodApp.Models;

namespace StepMoodApp.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    //Tabellerna i databasen
    public DbSet<DayEntry> Days => Set<DayEntry>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    
        modelBuilder.Entity<DayEntry>()
            .Property(d => d.Date)
            .HasConversion(
                d => d.ToString("yyyy-MM-dd"),
                s => DateOnly.Parse(s)
            );

        modelBuilder.Entity<DayEntry>()
            .HasIndex(d => new { d.UserId, d.Date })
            .IsUnique();

        modelBuilder.Entity<DayEntry>()
            .HasOne(d => d.User)
            .WithMany(u => u.Days)
            .HasForeignKey(d => d.UserId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<DayEntry>().OwnsOne(d => d.Weather);

        
    }
}