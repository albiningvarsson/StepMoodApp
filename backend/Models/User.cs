using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace StepMoodApp.Models;

public class User
{
    [Key]
    public int Id {get; set;}

    [Required]
    [MaxLength (50)] //Max 50 tecken användarnamn
    public string Username{get; set;} = string.Empty;

    [Required]
    public string PasswordHash{get; set;} = string.Empty;

    // Relatiionen till DayEntry one to many.
    public List<DayEntry> Days { get; set; } = new();


}