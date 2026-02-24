using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StepMoodApp.Models;

using Microsoft.EntityFrameworkCore;

namespace StepMoodApp.Data;

public class SqliteDayRepository : IDayRepository
{
    private readonly AppDbContext _db;

    public SqliteDayRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<DayEntry>> GetAllAsync(int userId)
    {
        return await _db.Days
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.Date)
            .ToListAsync();
    }

    public async Task<DayEntry?> GetByDateAsync(DateOnly date, int userId)
    {
        return await _db.Days.SingleOrDefaultAsync(d => d.Date == date && d.UserId == userId);
    }

    public async Task<bool> ExistsAsync(DateOnly date, int userId)
    {
        return await _db.Days.AnyAsync(d => d.Date == date && d.UserId == userId);
    }

    public async Task AddAsync(DayEntry day)
    {
        _db.Days.Add(day);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(DayEntry day)
    {
        // EF Core trackar ofta objektet automatiskt, 
        // men här säkerställer vi att ändringarna sparas.
        _db.Days.Update(day);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(DateOnly date, int userId)
    {
        var entry = await _db.Days.SingleOrDefaultAsync(d => d.Date == date && d.UserId == userId);
        if (entry != null)
        {
        _db.Days.Remove(entry);
        await _db.SaveChangesAsync();
        }
    }
}
