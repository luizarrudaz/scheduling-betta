using DotNetEnv;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NLog.Extensions.Logging;
using NLog.Web;
using SchedulingBetta.API.Application.FluentValidation;
using SchedulingBetta.API.Application.UseCases;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using SchedulingBetta.API.Infraestructure.Repositories;
using SchedulingBetta.API.Infraestructure.UnitOfWork;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuration & Logging
builder.Logging.ClearProviders();
builder.Logging.AddNLog();
builder.Host.UseNLog();

Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

// 2. Database Configuration
builder.Services.AddDbContext<SchedulingDbContext>(options =>
    options.UseNpgsql(Env.GetString("DB_CONNECTION_STRING")));

// 3. Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Env.GetString("JWT_ISSUER"),
            ValidAudience = Env.GetString("JWT_AUDIENCE"),
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Env.GetString("JWT_SECRET")))
        };
    });

// 4. API Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });

    // JWT Bearer auth configuration for Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 5. Dependency Injection
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<LdapAuthService>();

builder.Services.AddScoped<ISlotCalculator, SlotCalculator>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ICreateEventUseCase, CreateEventUseCase>();
builder.Services.AddScoped<IGetAllEventsUseCase, GetAllEventsUseCase>();
builder.Services.AddScoped<IGetEventByIdUseCase, GetEventByIdUseCase>();
builder.Services.AddScoped<IGetEventByNameUseCase, GetEventByNameUseCase>();
builder.Services.AddScoped<IUpdateEventUseCase, UpdateEventUseCase>();
builder.Services.AddScoped<IDeleteEventUseCase, DeleteEventUseCase>();

builder.Services.AddValidatorsFromAssemblyContaining<CreateEventCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<BreakWindowValidator>();

// 6. CORS
builder.Services.AddCors(options => options.AddPolicy("AllowFrontend", policy =>
    policy.WithOrigins("http://localhost:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

// 7. Middleware
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();