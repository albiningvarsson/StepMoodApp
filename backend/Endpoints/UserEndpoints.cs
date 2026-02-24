using StepMoodApp.Models;
using StepMoodApp.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace StepMoodApp.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        // REGISTRERA ANVÄNDARE
        app.MapPost("/register", async (UserRegistrationDto dto, AppDbContext db) =>
        {
            // Kolla om användaren redan finns
            if (await db.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return Results.BadRequest("Användarnamnet är upptaget.");
            }

            // Hasha lösenordet!
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Ok("Användare skapad!");
        });

        // LOGIN
        app.MapPost("/login", async (UserLoginDto dto, AppDbContext db) =>
        {
            // 1. Hitta användaren i databasen
            var user = await db.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null)
            {   
                return Results.Unauthorized(); // Användaren finns inte
            }   

            // 2. Kolla om lösenordet matchar hashen
            bool isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isValid)
            {
                return Results.Unauthorized(); // Fel lösenord
            }

            // 3. Just nu returnerar vi bara ett glatt meddelande och användarens ID
            return Results.Ok(new { id = user.Id, username = user.Username });
        });


    }
    



}



// En enkel klass (DTO) för att ta emot data från frontend
public record UserRegistrationDto(string Username, string Password);
public record UserLoginDto(string Username, string Password);