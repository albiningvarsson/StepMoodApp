using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StepMoodApp.Data;
using StepMoodApp.Endpoints;
using StepMoodApp.Services;

var builder = WebApplication.CreateBuilder(args);


// Kommandon cd backend & cd ui
// dotnet watch i backend
// npm run dev i UI

// 1. Swagger och verktyg
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. CORS (Helt rätt för Vite/React på 5173!)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 3. Databasen (Behålls som den är)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=days.db"));

// 4. REPOSITORY (Det nya!)
// Vi mappar interfacet mot klassen. "Scoped" betyder att en ny skapas per request.
builder.Services.AddScoped<IDayRepository, SqliteDayRepository>();
builder.Services.AddScoped<IUserRepository, SqliteUserRepository>();
builder.Services.AddScoped<JwtTokenService>();


// 5. EXCEPTION HANDLING (Det nya!)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails(); // Standardiserar felmeddelanden (RFC 7807)

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "StepMoodApp";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "StepMoodAppClient";
var jwtKey = builder.Configuration["Jwt:Key"] ?? "CHANGE_THIS_TO_A_LONG_RANDOM_KEY_32CHARS_MIN";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await MockDataSeeder.SeedAsync(db);
}

// 6. PIPELINE-ORDNING (Viktigt!)
app.UseExceptionHandler(); // Ska ligga först för att fånga allt under
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 7. Mappa dina endpoints
app.MapDayEndpoints();
app.MapUserEndpoints();

app.Run();