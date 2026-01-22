# Data Model: Todo App Backend

## Entity: Todo

### Fields
- **id**: Integer (Primary Key, Auto-generated)
  - Unique identifier for each todo item
  - Auto-incremented integer value
- **title**: String (Required, max length 255)
  - The main title/description of the todo item
  - Cannot be null or empty
- **description**: String (Optional, max length 1000)
  - Detailed description of the todo item
  - Can be null or empty string
- **completed**: Boolean (Required)
  - Status indicating whether the todo is completed
  - Default value: False
- **created_at**: DateTime (Required, Auto-generated)
  - Timestamp when the todo was created
  - Automatically set on record creation
- **updated_at**: DateTime (Required, Auto-generated)
  - Timestamp when the todo was last updated
  - Automatically updated on record modification

### Relationships
- No relationships required (standalone entity)

### Validation Rules
- Title must be present and not exceed 255 characters
- Description can be null but if present, must not exceed 1000 characters
- Completed field must be a boolean value
- created_at and updated_at are automatically managed by the system

### State Transitions
- New Todo: created with completed=False by default
- Update Todo: can toggle completed status or modify title/description
- Delete Todo: permanently removes the todo from the system

## Database Schema
```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes
- Primary key index on id (automatic)
- Consider additional indexes if needed for query performance