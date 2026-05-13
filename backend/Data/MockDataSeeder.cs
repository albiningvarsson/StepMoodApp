using Microsoft.EntityFrameworkCore;
using StepMoodApp.Models;

namespace StepMoodApp.Data;

public static class MockDataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        const string targetUsername = "albin999";

        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == targetUsername);
        if (user is null)
        {
            user = new User
            {
                Username = targetUsername,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("albin999-demo")
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        const int targetDayCount = 102;
        var random = new Random(999);
        var today = DateOnly.FromDateTime(DateTime.Today);
        var existingDates = await db.Days
            .Where(d => d.UserId == user.Id)
            .Select(d => d.Date)
            .ToListAsync();
        var knownDates = existingDates.ToHashSet();

        var entriesToAdd = new List<DayEntry>();
        var missingDays = targetDayCount - existingDates.Count;

        if (missingDays <= 0)
        {
            return;
        }

        // Fill from recent history first (yesterday and backwards).
        for (var i = 1; i <= 730 && entriesToAdd.Count < missingDays; i++)
        {
            var date = today.AddDays(-i);
            if (knownDates.Contains(date)) continue;
            entriesToAdd.Add(CreateMockDayEntry(user.Id, date, random));
            knownDates.Add(date);
        }

        if (entriesToAdd.Count > 0)
        {
            db.Days.AddRange(entriesToAdd);
            await db.SaveChangesAsync();
        }
    }

    private static int GetMockWeatherCode(Random random, int month)
    {
        var summer = month is >= 5 and <= 8;
        var roll = random.Next(100);

        if (summer)
        {
            if (roll < 40) return 0;
            if (roll < 65) return 2;
            if (roll < 82) return 45;
            if (roll < 96) return 61;
            return 95;
        }

        if (roll < 18) return 0;
        if (roll < 34) return 2;
        if (roll < 52) return 45;
        if (roll < 84) return 61;
        return 95;
    }

    private static double GetMockTemperature(Random random, int month, int weatherCode)
    {
        var seasonalBase = month switch
        {
            12 or 1 or 2 => -1,
            3 or 4 => 7,
            5 or 6 => 15,
            7 or 8 => 20,
            9 or 10 => 11,
            _ => 4
        };

        var weatherAdjustment = weatherCode <= 3 ? 3.2 : -1.8;
        return Math.Round(seasonalBase + weatherAdjustment + random.NextDouble() * 5 - 2.5, 1);
    }

    private static DayEntry CreateMockDayEntry(int userId, DateOnly date, Random random)
    {
        var monthBoost = date.Month switch
        {
            5 or 6 or 7 => 900,
            11 or 12 or 1 => -700,
            _ => 0
        };

        var weatherCode = GetMockWeatherCode(random, date.Month);
        var goodWeatherBoost = weatherCode <= 3 ? 1300 : 0;
        var baseSteps = 5200 + random.Next(-1800, 2400) + monthBoost + goodWeatherBoost;
        var steps = Math.Clamp(baseSteps, 1200, 18000);
        var mood = Math.Clamp(1 + (steps / 3500) + random.Next(-1, 2), 1, 5);
        if (steps >= 14000 && random.NextDouble() > 0.35)
        {
            mood = 5;
        }

        var activity = steps switch
        {
            >= 13000 => "Långpass löpning",
            >= 10000 => "Gym + promenad",
            >= 7500 => "Powerwalk",
            _ => "Lugn dag"
        };

        return new DayEntry
        {
            UserId = userId,
            Date = date,
            Steps = steps,
            Mood = mood,
            Note = $"Aktivitet: {activity}",
            Weather = new WeatherInfo
            {
                Temperature = GetMockTemperature(random, date.Month, weatherCode),
                Rain = weatherCode <= 3 ? 0 : Math.Round(random.NextDouble() * 6, 1),
                WindSpeed = Math.Round(1 + random.NextDouble() * 8, 1),
                WeatherCode = weatherCode
            }
        };
    }
}
