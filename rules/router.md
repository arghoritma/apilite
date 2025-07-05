🤖 AI RULES: Routes Development Guidelines

# MANDATORY RULES FOR CREATING ROUTES:

1. **IMPORT STRUCTURE**

   - Always import Router from 'ultimate-express'
   - Import required Controllers
   - Format: `import { Router } from 'ultimate-express';`
   - Format: `import { ControllerName } from '../controllers/ControllerName';`

2. **ROUTER INITIALIZATION**

   - Create router instance: `const router = Router();`
   - DO NOT create controller instances (use static methods instead)

3. **ROUTE DEFINITION PATTERN**

   - Call static method directly: `ControllerName.methodName`
   - DO NOT use: `new Controller()` or `.bind()`
   - Format: `router.method('/path', ControllerName.staticMethod)`

4. **MIDDLEWARE HANDLING**

   - For protected routes: `middleware as any, ControllerName.method as any`
   - Example: `authMiddleware as any, UserController.getProfile as any`
   - Middleware always before controller method

5. **ROUTE GROUPING**

   - Group routes based on access (public/protected)
   - Add comments for clarity
   - Order from most general to specific

6. **NAMING CONVENTION**

   - Route file: `nameRoutes.ts` (camelCase + Routes)
   - Router variable: `router` (lowercase)
   - Export: `export default router;`

7. **NO CONTROLLER INSTANCES**
   - DON'T: `const controller = new Controller();`
   - DON'T: `controller.method.bind(controller)`
   - USE: `Controller.staticMethod`

## IMPLEMENTATION EXAMPLE:

```typescript
import { Router } from "ultimate-express";
import { ProductController } from "../controllers/ProductController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);

// Protected routes
router.post("/", authMiddleware as any, ProductController.createProduct as any);
router.put(
  "/:id",
  authMiddleware as any,
  ProductController.updateProduct as any
);
router.delete(
  "/:id",
  authMiddleware as any,
  ProductController.deleteProduct as any
);

export default router;
```

ROUTE REGISTRATION IN INDEX:

```typescript
import { Router } from "ultimate-express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
```

REMEMBER: NO CONTROLLER INSTANCES, DIRECTLY CALL STATIC METHODS!

📋 Routes Checklist Before Commit:
☐ Import Router from 'ultimate-express'
☐ Import required Controllers
☐ No new Controller() or instances
☐ All routes use Controller.staticMethod
☐ Middleware uses as any pattern
☐ Routes are grouped (public/protected)
☐ File naming: nameRoutes.ts
☐ Export default router
☐ No .bind() anywhere

🔧 New Routes Template:

```typescript
import { Router } from 'ultimate-express';
import { [NAME]Controller } from '../controllers/[NAME]Controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/[ENDPOINT]', [NAME]Controller.[METHOD_NAME]);
router.post('/[ENDPOINT]', [NAME]Controller.[METHOD_NAME]);

// Protected routes
router.get('/[PROTECTED_ENDPOINT]', authMiddleware as any, [NAME]Controller.[METHOD_NAME] as any);
router.post('/[PROTECTED_ENDPOINT]', authMiddleware as any, [NAME]Controller.[METHOD_NAME] as any);

export default router;
```
