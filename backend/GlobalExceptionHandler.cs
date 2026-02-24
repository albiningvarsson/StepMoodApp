using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    // Här använder vi Dependency Injection igen! 
    // .NET ger oss automatiskt en logger så vi kan se fel i terminalen.
    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, 
        Exception exception, 
        CancellationToken cancellationToken)
    {
        // 1. Logga felet (Viktigt för dig som utvecklare!)
        // Det här dyker upp i din konsol med röd text.
        _logger.LogError(
            exception, "Ett ohanterat fel uppstod: {Message}", exception.Message);

        // 2. Skapa ett snyggt svar enligt REST-standard (Problem Details)
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server Error",
            Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
            Detail = "Något gick snett på servern. Vi har loggat händelsen och undersöker saken."
        };

        // 3. Konfigurera HTTP-svaret
        httpContext.Response.StatusCode = problemDetails.Status.Value;
        httpContext.Response.ContentType = "application/problem+json";

        // 4. Skicka tillbaka JSON till klienten (t.ex. din React-app)
        await httpContext.Response
            .WriteAsJsonAsync(problemDetails, cancellationToken);

        // Returnera true för att säga till .NET att vi har tagit hand om felet
        return true; 
    }
}