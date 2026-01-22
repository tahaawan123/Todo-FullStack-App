from fastapi import HTTPException, status

class TodoNotFoundException(HTTPException):
    """
    Exception raised when a todo item is not found.
    """
    def __init__(self, todo_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

class ValidationErrorException(HTTPException):
    """
    Exception raised when there's a validation error in the request.
    """
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class DatabaseErrorException(HTTPException):
    """
    Exception raised when there's a database error.
    """
    def __init__(self, detail: str = "Database error occurred"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )