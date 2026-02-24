using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StepMoodApp.Models;

public class DayEntry
{
    [Key] 
    public int Id { get; set; } //Denna blir nu den unika nyckeln för raden

    [Required]
    public DateOnly Date { get; set; }

    [Range(0, 100000)]
    public int Steps { get; set; }

    [Range(1, 5)]
    public int Mood { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    // --- NYA FÄLT FÖR ANVÄNDARE ---
    
    [Required]
    public int UserId { get; set; } // Foreign Key (Kopplingen)

    [JsonIgnore]
    public User? User { get; set; } // Gör att vi kan navigera till användaren i koden
}