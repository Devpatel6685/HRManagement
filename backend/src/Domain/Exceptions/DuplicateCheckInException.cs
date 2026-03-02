namespace HRManagement.Domain.Exceptions;

public class DuplicateCheckInException : InvalidOperationException
{
    public DuplicateCheckInException(string message) : base(message) { }
}
