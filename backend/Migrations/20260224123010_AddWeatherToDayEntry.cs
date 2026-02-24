using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StepMoodApp.Migrations
{
    /// <inheritdoc />
    public partial class AddWeatherToDayEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Weather_Rain",
                table: "Days",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Weather_Temperature",
                table: "Days",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Weather_WeatherCode",
                table: "Days",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Weather_WindSpeed",
                table: "Days",
                type: "REAL",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Weather_Rain",
                table: "Days");

            migrationBuilder.DropColumn(
                name: "Weather_Temperature",
                table: "Days");

            migrationBuilder.DropColumn(
                name: "Weather_WeatherCode",
                table: "Days");

            migrationBuilder.DropColumn(
                name: "Weather_WindSpeed",
                table: "Days");
        }
    }
}
