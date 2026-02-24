using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StepMoodApp.Models;

namespace StepMoodApp.DTOs;

public record DayCreateDto(
    DateOnly Date,
    int Steps,
    int Mood,
    string? Note,
    WeatherInfo? Weather
);
