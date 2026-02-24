using Microsoft.EntityFrameworkCore;
using StepMoodApp.Models;

namespace StepMoodApp.Data;

public class SqliteUserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public SqliteUserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _db.Users.SingleOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _db.Users.FindAsync(id);
    }

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string username)
    {
        return await _db.Users.AnyAsync(u => u.Username == username);
    }
}