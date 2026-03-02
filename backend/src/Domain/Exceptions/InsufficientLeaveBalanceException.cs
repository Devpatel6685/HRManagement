namespace HRManagement.Domain.Exceptions;

public class InsufficientLeaveBalanceException : InvalidOperationException
{
    public InsufficientLeaveBalanceException(string message) : base(message) { }
}
