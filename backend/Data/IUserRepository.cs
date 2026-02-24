using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StepMoodApp.Models;

namespace StepMoodApp.Data;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task AddAsync(User user);
    Task<bool> ExistsAsync(string username);
}