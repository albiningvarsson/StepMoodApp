using Microsoft.EntityFrameworkCore;
using StepMoodApp.Data;
using StepMoodApp.Endpoints;

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

// 5. EXCEPTION HANDLING (Det nya!)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails(); // Standardiserar felmeddelanden (RFC 7807)

var app = builder.Build();

// 6. PIPELINE-ORDNING (Viktigt!)
app.UseExceptionHandler(); // Ska ligga först för att fånga allt under
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 7. Mappa dina endpoints
app.MapDayEndpoints();
app.MapUserEndpoints();

app.Run();