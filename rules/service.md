# 🤖 AI RULES: Services Development Guidelines

## MANDATORY RULES FOR CREATING SERVICES:

1. **CLASS STRUCTURE**

- Use regular class (not static)
- Services are instance-based for flexibility and state management
- Format: `export class NameService {}`
- Constructor can accept dependencies

2. **METHOD DEFINITION**

- Use instance methods (not static)
- Format: `async methodName(): Promise<ReturnType>`
- All async operations must return Promise
- Method names must be descriptive and action-based

3. **DEPENDENCY INJECTION PATTERN**

- Constructor accepts optional dependencies
- Set default values if dependency not provided
- Store dependencies as private properties

4. **ERROR HANDLING**

- Services MUST throw errors, not return error objects
- Use descriptive error messages
- Let controller handle HTTP responses
- Format: `throw new Error('Descriptive error message');`

5. **BUSINESS LOGIC SEPARATION**

- Services contain pure business logic
- No HTTP response handling (res.json, res.status)
- No req/res objects as parameters
- Focus on data processing and external operations

6. **INPUT VALIDATION**

- Validate input parameters at the start of method
- Throw error for invalid inputs
- Use proper type checking

7. **RETURN TYPES**

- Always specify return types with Promise
- Return meaningful data structures
- Don't return HTTP status codes or response objects

## IMPLEMENTATION EXAMPLE:

```typescript
import db from "../config/database";
import axios from "axios";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || process.env.API_URL || "https://api.example.com";
  }

  async createUser(userData: Partial<UserData>): Promise<UserData> {
    if (!userData.email || !userData.name) {
      throw new Error("Name and email are required");
    }

    try {
      const [user] = await db("users").insert(userData).returning("*");
      return this.formatUserData(user);
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getUserById(id: string): Promise<UserData> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const user = await db("users").where({ id }).first();

      if (!user) {
        throw new Error("User not found");
      }

      return this.formatUserData(user);
    } catch (error) {
      throw new Error(
        `Failed to get user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private formatUserData(rawUser: any): UserData {
    return {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
    };
  }
}
```

## USAGE IN CONTROLLER:

```typescript
export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      // Create service instance inside method
      const userService = new UserService();
      const result = await userService.createUser({ name, email });

      res.json({
        code: "SUCCESS",
        message: "User created successfully",
        data: result,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        code: "ERROR",
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

## REMEMBER: SERVICES = BUSINESS LOGIC, CONTROLLERS = HTTP HANDLING!

📋 Service Commit Checklist:
☐ Class uses instance methods (not static)
☐ Constructor accepts optional dependencies
☐ All methods async return Promise with proper types
☐ Error handling uses throw Error()
☐ No HTTP response handling (res.json, res.status)
☐ Input validation at start of method
☐ Private methods for internal logic
☐ Proper TypeScript interfaces
☐ File naming: NameService.ts

🔧 New Service Template:

```typescript
import db from '../config/database';

interface [DATA_TYPE] {
  id: string;
  // Define properties
}

export class [NAME]Service {
  private config: any;

  constructor(config?: any) {
    this.config = config || {};
  }

  async [METHOD_NAME](param: string): Promise<[RETURN_TYPE]> {
    if (!param) {
      throw new Error('Parameter is required');
    }

    try {
      // Business logic here
      const result = await db('table').where({ param }).first();

      if (!result) {
        throw new Error('Data not found');
      }

      return this.formatData(result);
    } catch (error) {
      throw new Error(`Failed to [ACTION]: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatData(rawData: any): [RETURN_TYPE] {
    // Transform data
    return transformedData;
  }
}
```

This pattern ensures:

- **Controller**: Static methods, create service instance inside method
- **Service**: Instance methods, pure business logic, throw errors
- **Separation of Concerns**: Controller handles HTTP, Service handles business logic
