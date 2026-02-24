using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StepMoodApp.Models;

public class WeatherInfo
{
    public double Temperature { get; set; }
    public double Rain { get; set; }
    public double WindSpeed { get; set; }
    public int WeatherCode { get; set; }
}

