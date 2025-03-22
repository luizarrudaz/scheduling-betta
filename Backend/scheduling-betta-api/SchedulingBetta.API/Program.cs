using DotNetEnv;
using SchedulingBetta.API.Authentication;

var builder = WebApplication.CreateBuilder(args);

Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Configuration.AddEnvironmentVariables();

builder.Services.AddScoped<LdapAuthService>();
builder.Services.AddScoped<JwtService>();

var app = builder.Build();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();