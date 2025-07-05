🤖 AI RULES: Routes Development Guidelines


# MANDATORY RULES FOR CREATING CONTROLLERS:

1. **ALWAYS USE STATIC METHODS**

   - All controller methods MUST be static
   - Format: `static async methodName(req: Request, res: Response)`
   - Example: `static async register(req: Request, res: Response)`

2. **DO NOT USE INSTANCE PROPERTIES**

   - Don't use `this.propertyName`
   - Don't use constructor to store dependencies
   - All dependencies are created within methods

3. **PATTERN FOR DEPENDENCIES**

   - Create service instance inside methods that need it
   - Example: `const pixelService = new PixelService();`
   - Don't store as class property

4. **CORRECT CONTROLLER STRUCTURE**

   ```typescript
   export class NameController {
     static async methodName(req: Request, res: Response) {
       try {
         // Create dependencies here
         const service = new SomeService();

         // Controller logic
         const result = await service.doSomething();

         // Response
         res.json({ success: true, data: result });
       } catch (error) {
         res.status(500).json({
           success: false,
           error: error instanceof Error ? error.message : "Unknown error",
         });
       }
     }
   }
   ```

5. **ROUTING PATTERN**

- Call directly without bind: `ControllerName.methodName`
- Example: `router.get('/endpoint', ControllerName.methodName)`
- DO NOT use: `controller.method.bind(controller)`

6. **IMPORT CONSISTENCY**

- Always use: `import { Request, Response } from 'ultimate-express'`
- Don't mix with express

7. **ERROR HANDLING STANDARD**

- Always use try-catch
- Consistent error response format
- Log errors with console.error

## IMPLEMENTATION EXAMPLE:

```typescript
export class ExampleController {
  static async getData(req: Request, res: Response) {
    try {
      const dataService = new DataService();
      const result = await dataService.fetchData();

      res.json({
        code: "SUCCESS",
        message: "Data retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get data error:", error);
      res.status(500).json({
        code: "ERROR",
        message: "Failed to get data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

## ROUTING:

```typescript
router.get("/data", ExampleController.getData);
```

## REMEMBER: NO BIND, NO INSTANCE PROPERTIES, ALL STATIC!

## 📋 Controller Commit Checklist:

☐ All methods use static
☐ No this. in code
☐ No constructor with dependencies
☐ Dependencies created within method
☐ Import using ultimate-express
☐ Routing not using .bind()
☐ Error handling using try-catch
☐ Consistent response format

## 🔧 New Controller Template:

```typescript
import { Request, Response } from 'ultimate-express';

export class [NAME]Controller {
  static async [METHOD_NAME](req: Request, res: Response) {
    try {
      // Validate input if needed
      const { param1, param2 } = req.body;

      // Create service instance
      const service = new [SERVICE_NAME]();

      // Business logic
      const result = await service.[METHOD]();

      // Success response
      res.json({
        code: 'SUCCESS',
        message: '[SUCCESS_MESSAGE]',
        data: result
      });
    } catch (error) {
      console.error('[METHOD_NAME] error:', error);
      res.status(500).json({
        code: 'ERROR',
        message: '[ERROR_MESSAGE]',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
```
