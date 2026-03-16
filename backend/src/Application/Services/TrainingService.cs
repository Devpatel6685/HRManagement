using HRManagement.Application.DTOs.Training;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class TrainingService : ITrainingService
{
    private readonly IApplicationDbContext _context;

    public TrainingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrainingDto> CreateTrainingAsync(CreateTrainingDto dto, CancellationToken ct = default)
    {
        if (dto.EndDate < dto.StartDate)
            throw new ArgumentException("End date must be on or after start date.");

        if (dto.MaxParticipants < 1)
            throw new ArgumentException("Max participants must be at least 1.");

        var training = new Training
        {
            Title           = dto.Title,
            Description     = dto.Description,
            StartDate       = DateTime.SpecifyKind(dto.StartDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
            EndDate         = DateTime.SpecifyKind(dto.EndDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
            Trainer         = dto.Trainer,
            MaxParticipants = dto.MaxParticipants,
        };

        _context.Trainings.Add(training);
        await _context.SaveChangesAsync(ct);

        return MapToDto(training, 0);
    }

    public async Task<IReadOnlyList<TrainingDto>> GetAllTrainingsAsync(CancellationToken ct = default)
    {
        var trainings = await _context.Trainings
            .Include(t => t.EmployeeTrainings)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync(ct);

        return trainings
            .Select(t => MapToDto(t, t.EmployeeTrainings.Count))
            .ToList();
    }

    public async Task<IReadOnlyList<TrainingDto>> GetUpcomingTrainingsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var trainings = await _context.Trainings
            .Include(t => t.EmployeeTrainings)
            .Where(t => t.StartDate > now)
            .OrderBy(t => t.StartDate)
            .ToListAsync(ct);

        return trainings
            .Select(t => MapToDto(t, t.EmployeeTrainings.Count))
            .ToList();
    }

    public async Task<IReadOnlyList<EmployeeTrainingDto>> AssignEmployeesAsync(
        Guid trainingId, AssignEmployeesDto dto, CancellationToken ct = default)
    {
        var training = await _context.Trainings.FindAsync([trainingId], ct)
            ?? throw new KeyNotFoundException($"Training '{trainingId}' not found.");

        // Get existing enrollments to skip duplicates
        var existingIds = await _context.EmployeeTrainings
            .Where(et => et.TrainingId == trainingId)
            .Select(et => et.EmployeeId)
            .ToListAsync(ct);

        var newIds = dto.EmployeeIds.Except(existingIds).ToList();

        // Validate employees exist
        var employees = await _context.Employees
            .Where(e => newIds.Contains(e.Id))
            .ToListAsync(ct);

        var employeeMap = employees.ToDictionary(e => e.Id);

        var newEnrollments = newIds.Select(empId => new EmployeeTraining
        {
            EmployeeId  = empId,
            TrainingId  = trainingId,
            Status      = EmployeeTrainingStatus.Enrolled,
        }).ToList();

        _context.EmployeeTrainings.AddRange(newEnrollments);
        await _context.SaveChangesAsync(ct);

        // Return all enrollments for this training
        return newEnrollments.Select(et => MapToEmployeeTrainingDto(et, training, employeeMap)).ToList();
    }

    public async Task<EmployeeTrainingDto> MarkCompletedAsync(
        Guid employeeTrainingId, MarkCompletedDto dto, CancellationToken ct = default)
    {
        var et = await _context.EmployeeTrainings
            .Include(e => e.Employee)
            .Include(e => e.Training)
            .FirstOrDefaultAsync(e => e.Id == employeeTrainingId, ct)
            ?? throw new KeyNotFoundException($"Enrollment '{employeeTrainingId}' not found.");

        et.Status         = EmployeeTrainingStatus.Completed;
        et.CompletionDate = DateTime.UtcNow;
        et.Score          = dto.Score;

        await _context.SaveChangesAsync(ct);

        return new EmployeeTrainingDto
        {
            Id             = et.Id,
            TrainingId     = et.TrainingId,
            TrainingTitle  = et.Training.Title,
            StartDate      = DateOnly.FromDateTime(et.Training.StartDate),
            EndDate        = DateOnly.FromDateTime(et.Training.EndDate),
            Trainer        = et.Training.Trainer,
            EmployeeId     = et.EmployeeId,
            EmployeeName   = $"{et.Employee.FirstName} {et.Employee.LastName}",
            Status         = et.Status.ToString(),
            CompletionDate = et.CompletionDate,
            Score          = et.Score,
        };
    }

    public async Task<IReadOnlyList<EmployeeTrainingDto>> GetMyTrainingsAsync(
        Guid employeeId, CancellationToken ct = default)
    {
        var list = await _context.EmployeeTrainings
            .Include(et => et.Training)
            .Include(et => et.Employee)
            .Where(et => et.EmployeeId == employeeId)
            .OrderByDescending(et => et.Training.StartDate)
            .ToListAsync(ct);

        return list.Select(et => new EmployeeTrainingDto
        {
            Id             = et.Id,
            TrainingId     = et.TrainingId,
            TrainingTitle  = et.Training.Title,
            StartDate      = DateOnly.FromDateTime(et.Training.StartDate),
            EndDate        = DateOnly.FromDateTime(et.Training.EndDate),
            Trainer        = et.Training.Trainer,
            EmployeeId     = et.EmployeeId,
            EmployeeName   = $"{et.Employee.FirstName} {et.Employee.LastName}",
            Status         = et.Status.ToString(),
            CompletionDate = et.CompletionDate,
            Score          = et.Score,
        }).ToList();
    }

    public async Task DeleteTrainingAsync(Guid trainingId, CancellationToken ct = default)
    {
        var training = await _context.Trainings.FindAsync([trainingId], ct)
            ?? throw new KeyNotFoundException($"Training '{trainingId}' not found.");

        _context.Trainings.Remove(training);
        await _context.SaveChangesAsync(ct);
    }

    private static TrainingDto MapToDto(Training t, int enrolledCount) => new()
    {
        Id              = t.Id,
        Title           = t.Title,
        Description     = t.Description,
        StartDate       = DateOnly.FromDateTime(t.StartDate),
        EndDate         = DateOnly.FromDateTime(t.EndDate),
        Trainer         = t.Trainer,
        MaxParticipants = t.MaxParticipants,
        EnrolledCount   = enrolledCount,
        CreatedAt       = t.CreatedAt,
    };

    private static EmployeeTrainingDto MapToEmployeeTrainingDto(
        EmployeeTraining et, Training training, Dictionary<Guid, Employee> employeeMap)
    {
        var employee = employeeMap.TryGetValue(et.EmployeeId, out var emp) ? emp : null;
        return new EmployeeTrainingDto
        {
            Id             = et.Id,
            TrainingId     = et.TrainingId,
            TrainingTitle  = training.Title,
            StartDate      = DateOnly.FromDateTime(training.StartDate),
            EndDate        = DateOnly.FromDateTime(training.EndDate),
            Trainer        = training.Trainer,
            EmployeeId     = et.EmployeeId,
            EmployeeName   = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            Status         = et.Status.ToString(),
            CompletionDate = et.CompletionDate,
            Score          = et.Score,
        };
    }
}
