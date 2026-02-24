using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StepMoodApp.Models;

namespace StepMoodApp.Data;

    public interface IDayRepository
    {
    Task<IEnumerable<DayEntry>> GetAllAsync(int userId);
    Task<DayEntry?> GetByDateAsync(DateOnly date, int userId);
    Task AddAsync(DayEntry day);
    Task UpdateAsync(DayEntry day);
    Task DeleteAsync(DateOnly date, int userId);
    Task<bool> ExistsAsync(DateOnly date, int userId);
    }
