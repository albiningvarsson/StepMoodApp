using StepMoodApp.Models;
using StepMoodApp.Data;
using BCrypt.Net;
using StepMoodApp.DTOs;

namespace StepMoodApp.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        // REGISTRERA ANVÄNDARE
        app.MapPost("/register", async (UserRegistrationDto dto, IUserRepository repo) =>
        {
            // 1. Kolla om användaren redan finns via repot
            if (await repo.ExistsAsync(dto.Username))
            {
                return Results.BadRequest("Användarnamnet är upptaget.");
            }

            // 2. Skapa användarobjektet och hasha lösenordet
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            // 3. Spara via repot
            await repo.AddAsync(newUser);

            return Results.Ok("Användare skapad!");
        });

        // LOGIN
        app.MapPost("/login", async (UserLoginDto dto, IUserRepository repo) =>
        {
            // 1. Hitta användaren via repot
            var user = await repo.GetByUsernameAsync(dto.Username);

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

            // 3. Returnera ID och användarnamn
            return Results.Ok(new { id = user.Id, username = user.Username });
        });
    }
}
