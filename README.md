StepMood API

Ett backend-projekt byggt med .NET 8 för att logga dagliga aktiviteter och humör. Fokus ligger på ren kod, tydlig arkitektur och säkerhet.

Tekniker
Framework: .NET 8 (Minimal APIs)

ORM: Entity Framework Core (SQLite)

Säkerhet: BCrypt för lösenordshashing

Arkitektur: Repository Pattern & DTOs

Funktioner i urval
Repository Pattern: Separerar databaslogik från API-endpoints för ökad testbarhet och underhållbarhet.

Säker inloggning: Användarhantering med krypterade lösenord (BCrypt).

Global felhantering: Centraliserad loggning och felhantering som ger tydliga svar till klienten.

Dataintegritet: Validering av indata och databasindex som förhindrar dubbletter.

Installation & Körning
Klona repot

Kör dotnet restore

Starta med dotnet run

Testa endpoints via Swagger på /swagger

Framtida Utveckling
Implementering av JWT (JSON Web Tokens) för sessionshantering.
