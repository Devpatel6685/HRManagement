using AutoMapper;
using HRManagement.Application.DTOs.Employees;
using HRManagement.Domain.Entities;

namespace HRManagement.Application.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        CreateMap<Employee, EmployeeListDto>()
            .ForMember(d => d.FullName,
                o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Email,
                o => o.MapFrom(s => s.User != null ? s.User.Email : null))
            .ForMember(d => d.DepartmentName,
                o => o.MapFrom(s => s.Department != null ? s.Department.Name : null))
            .ForMember(d => d.DesignationTitle,
                o => o.MapFrom(s => s.Designation != null ? s.Designation.Title : null));

        CreateMap<Employee, EmployeeDetailDto>()
            .ForMember(d => d.FullName,
                o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Email,
                o => o.MapFrom(s => s.User != null ? s.User.Email : null))
            .ForMember(d => d.DepartmentName,
                o => o.MapFrom(s => s.Department != null ? s.Department.Name : null))
            .ForMember(d => d.DesignationTitle,
                o => o.MapFrom(s => s.Designation != null ? s.Designation.Title : null))
            .ForMember(d => d.ManagerName,
                o => o.MapFrom(s => s.Manager != null
                    ? $"{s.Manager.FirstName} {s.Manager.LastName}"
                    : null));
    }
}
