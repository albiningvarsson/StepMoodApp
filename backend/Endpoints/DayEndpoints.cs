using StepMoodApp.Data;
using StepMoodApp.Models;

namespace StepMoodApp.Endpoints;

static class DayEndpoints
{
    public static void MapDayEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /days?userId=1 - Hämtar ENDAST för den användaren
        app.MapGet("/days", async (int userId, IDayRepository repo) =>
        {
            var days = await repo.GetAllAsync(userId);
    
            return Results.Ok(days);
        })
        .WithName("GetDays")
        .WithOpenApi();
        
        // GET /days/{date}
        app.MapGet("/days/{date}", async (string date, int userId, IDayRepository repo) =>
        {
            if (!TryParseDate(date, out var parsedDate, out var error))
                return error;

            var day = await repo.GetByDateAsync(parsedDate, userId);

            return day is null ? Results.NotFound() : Results.Ok(day);
        })
        .WithName("GetDayByDate")
        .WithOpenApi();

        // GET /days/today
        app.MapGet("/days/today", async (int userId, IDayRepository repo) =>
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var day = await repo.GetByDateAsync(today, userId);

            return day is null ? Results.NotFound() : Results.Ok(day);
        })
        .WithName("GetToday")
        .WithOpenApi();

        // POST /days
        app.MapPost("/days", async (DayEntry newDay, int userId, IDayRepository repo) =>
        {
            newDay.UserId = userId;
            // Validering behåller vi här (detta är API-logik)
            var today = DateOnly.FromDateTime(DateTime.Today);
            if (newDay.Date > today) return Results.BadRequest("Date cannot be in the future");
            if (newDay.Steps < 0) return Results.BadRequest("Steps can't be negative");
            if (newDay.Mood < 1 || newDay.Mood > 5) return Results.BadRequest("Mood must be 1-5");

            if (await repo.ExistsAsync(newDay.Date, newDay.UserId))
                return Results.Conflict("An entry for this date already exists on your account.");

            await repo.AddAsync(newDay);
            return Results.Created($"/days/{newDay.Date:yyyy-MM-dd}", newDay);
        })
        .WithName("CreateDay")
        .WithOpenApi();

        // DELETE /days/{date}
        app.MapDelete("/days/{date}", async (string date, int userId, IDayRepository repo) =>
        {
            if (!TryParseDate(date, out var parsedDate, out var error)) return error;

            if (!await repo.ExistsAsync(parsedDate, userId)) return Results.NotFound();

            await repo.DeleteAsync(parsedDate, userId);
            return Results.NoContent();
        })
        .WithName("DeleteDay")
        .WithOpenApi();

        // PUT /days/{date}
        app.MapPut("/days/{date}", async (string date, DayEntry updatedDay, int userId, IDayRepository repo) =>
        {
            if (!TryParseDate(date, out var parsedDate, out var error)) return error;

            var existing = await repo.GetByDateAsync(parsedDate, userId);
            if (existing is null) return Results.NotFound("Ingen post hittades för detta datum på ditt konto.");

            if (updatedDay.Steps < 0) return Results.BadRequest("Steps can't be negative.");
            if (updatedDay.Mood < 1 || updatedDay.Mood > 5) return Results.BadRequest("Mood 1-5.");
            if (updatedDay.Date != parsedDate) return Results.BadRequest("Date mismatch.");

            // Uppdatera och spara via repo
            existing.Steps = updatedDay.Steps;
            existing.Mood = updatedDay.Mood;
            existing.Note = updatedDay.Note;

            await repo.UpdateAsync(existing);
            return Results.Ok(existing);
        })
        .WithName("UpdateDay")
        .WithOpenApi();
    }

    // Behåller TryParseDate här som en privat hjälpmetod
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
}