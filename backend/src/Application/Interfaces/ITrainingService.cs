using HRManagement.Application.DTOs.Training;

namespace HRManagement.Application.Interfaces;

public interface ITrainingService
{
    Task<TrainingDto> CreateTrainingAsync(CreateTrainingDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<TrainingDto>> GetAllTrainingsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<TrainingDto>> GetUpcomingTrainingsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EmployeeTrainingDto>> AssignEmployeesAsync(Guid trainingId, AssignEmployeesDto dto, CancellationToken ct = default);
    Task<EmployeeTrainingDto> MarkCompletedAsync(Guid employeeTrainingId, MarkCompletedDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<EmployeeTrainingDto>> GetMyTrainingsAsync(Guid employeeId, CancellationToken ct = default);
    Task DeleteTrainingAsync(Guid trainingId, CancellationToken ct = default);
}
