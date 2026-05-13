using StepMoodApp.Data;
using StepMoodApp.Models;
using StepMoodApp.DTOs; // Glöm inte denna!
using System.Security.Claims;

namespace StepMoodApp.Endpoints;

static class DayEndpoints
{
    public static void MapDayEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /days - Returnerar en lista av DayResponseDto
        app.MapGet("/days", async (ClaimsPrincipal user, IDayRepository repo) =>
        {
            if (!TryGetUserId(user, out var userId, out var authError)) return authError;
            var days = await repo.GetAllAsync(userId);
            
            // Här mappar vi om från DayEntry till DayResponseDto
            var response = days.Select(d => new DayResponseDto(
                d.Date, 
                d.Steps, 
                d.Mood, 
                d.Note,
                d.Weather));
    
            return Results.Ok(response);
        })
        .RequireAuthorization();
        
        // POST /days - Tar emot DayCreateDto
        app.MapPost("/days", async (ClaimsPrincipal user, DayCreateDto dto, IDayRepository repo) =>
        {
            if (!TryGetUserId(user, out var userId, out var authError)) return authError;
            // Validering
            var today = DateOnly.FromDateTime(DateTime.Today);
            if (dto.Date > today) return Results.BadRequest("Date cannot be in the future");
            if (dto.Steps < 0) return Results.BadRequest("Steps can't be negative");

            if (await repo.ExistsAsync(dto.Date, userId))
                return Results.Conflict("Entry already exists for this date.");

            // Mappa DTO -> DayEntry (för att spara i DB)
            var newEntry = new DayEntry
            {
                Date = dto.Date,
                Steps = dto.Steps,
                Mood = dto.Mood,
                Note = dto.Note,
                UserId = userId,
                Weather = dto.Weather
            };

            await repo.AddAsync(newEntry);

            // Vi returnerar en ResponseDto även här för att vara konsekventa
            var response = new DayResponseDto(newEntry.Date, newEntry.Steps, newEntry.Mood, newEntry.Note, newEntry.Weather);
            return Results.Created($"/days/{newEntry.Date}", response);
        })
        .RequireAuthorization();

        // PUT /days/{date} - Använder också DayCreateDto (eller en egen UpdateDto)
        app.MapPut("/days/{date}", async (ClaimsPrincipal user, string date, DayCreateDto dto, IDayRepository repo) =>
        {
            if (!TryGetUserId(user, out var userId, out var authError)) return authError;
            if (!TryParseDate(date, out var parsedDate, out var error)) return error;

            var existing = await repo.GetByDateAsync(parsedDate, userId);
            if (existing is null) return Results.NotFound("Ingen post hittades.");

            if (dto.Date != parsedDate) return Results.BadRequest("Date mismatch.");

            // Uppdatera fälten från DTO:n
            existing.Steps = dto.Steps;
            existing.Mood = dto.Mood;
            existing.Note = dto.Note;
            existing.Weather = dto.Weather;

            await repo.UpdateAsync(existing);
            return Results.Ok(new DayResponseDto(existing.Date, existing.Steps, existing.Mood, existing.Note, existing.Weather));
        })
        .RequireAuthorization();

        // DELETE /days/{date}
        app.MapDelete("/days/{date}", async (ClaimsPrincipal user, string date, IDayRepository repo) =>
        {
            if (!TryGetUserId(user, out var userId, out var authError)) return authError;
            // 1. Kolla så datumet är giltigt
            if (!TryParseDate(date, out var parsedDate, out var error)) 
            return error;

            // 2. Kolla om posten ens finns innan vi försöker ta bort den
            if (!await repo.ExistsAsync(parsedDate, userId)) 
            return Results.NotFound("Hittade ingen post att radera.");

            // 3. Utför raderingen via repot
            await repo.DeleteAsync(parsedDate, userId);
    
            return Results.NoContent(); // 204 betyder "Lyckades, men finns inget mer att skicka"
        })
        .WithName("DeleteDay")
        .RequireAuthorization()
        .WithOpenApi();
    }

    static bool TryParseDate(string date, out DateOnly parsedDate, out IResult error)
    {
        if (!DateOnly.TryParse(date, out parsedDate))
        {
            error = Results.BadRequest("Invalid date format. Use YYYY-MM-DD.");
            return false;
        }
        error = null!;
        return true;
    }

    static bool TryGetUserId(ClaimsPrincipal user, out int userId, out IResult error)
    {
        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out userId))
        {
            error = null!;
            return true;
        }

        error = Results.Unauthorized();
        return false;
    }
}