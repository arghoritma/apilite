# 🔧 AI RULES: Service Development Guidelines

## MANDATORY RULES FOR CREATING SERVICES:

### 1. **CLASS STRUCTURE & EXPORT PATTERN**

- Use regular class (not static)
- Services are instance-based for dependency injection and state management
- Format: `export class NameService {}`
- Constructor accepts optional dependencies with default values
- Private properties for dependencies, configuration, and state

### 2. **METHOD DEFINITION**

- Use instance methods (not static)
- Format: `async methodName(params): Promise<ReturnType>`
- All async operations must return Promise with proper types
- Method names must be descriptive and action-based
- Use proper TypeScript interfaces for parameters and return types

### 3. **DEPENDENCY INJECTION PATTERN**

- Constructor accepts optional dependencies/configuration
- Set default values if dependency not provided
- Store dependencies as private properties
- Support both direct instantiation and dependency injection

### 4. **ERROR HANDLING**

- Services MUST throw errors, not return error objects
- Use descriptive error messages with context
- Let controller handle HTTP responses
- Format: `throw new Error('Descriptive error message with context');`
- Handle specific error types and provide meaningful context

### 5. **BUSINESS LOGIC SEPARATION**

- Services contain pure business logic
- No HTTP response handling (res.json, res.status)
- No req/res objects as parameters
- Focus on data processing and external operations
- Abstract complex operations into private methods

### 6. **INPUT VALIDATION**

- Validate input parameters at the start of methods
- Throw descriptive errors for invalid inputs
- Use proper type checking and guards
- Validate required fields and formats

### 7. **RETURN TYPES & INTERFACES**

- Always specify return types with Promise
- Define proper TypeScript interfaces for complex return types
- Return meaningful data structures
- Don't return HTTP status codes or response objects

### 8. **CONNECTION & RESOURCE MANAGEMENT**

- Handle connection states properly for external services
- Implement connection testing/health checks
- Graceful degradation when external services unavailable
- Proper resource cleanup and connection pooling

