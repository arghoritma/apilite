# 🛣️ AI RULES: Routes Development Guidelines

## MANDATORY RULES FOR CREATING ROUTES:

### 1. **FILE STRUCTURE & NAMING**

- File naming: `[resource]Routes.ts` (e.g., userRoutes.ts, productRoutes.ts)
- Location: `src/routes/` directory
- Use Router from 'ultimate-express'
- Export default router instance

### 2. **IMPORT PATTERN**

- Import Router from 'ultimate-express'
- Import corresponding Controller
- Import required middlewares
- Group imports logically (framework, controllers, middlewares)

### 3. **ROUTER INITIALIZATION**

- Create router instance: `const router = Router();`
- Export as default: `export default router;`
- No router options unless specifically needed

### 4. **ROUTE ORGANIZATION**

- Group routes by access level (public first, then protected)
- Order routes logically (CRUD order: CREATE, READ, UPDATE, DELETE)
- Use clear comments to separate route groups
- Consistent spacing between route groups

### 5. **ROUTE DEFINITION PATTERN**

- Use HTTP method functions: `router.get()`, `router.post()`, etc.
- Path should be descriptive and RESTful
- Controller method reference (no arrow functions)
- Middleware before controller method

### 6. **MIDDLEWARE APPLICATION**

- Apply middlewares in logical order
- Authentication middleware for protected routes
- Validation middleware before controller
- Rate limiting for sensitive endpoints

### 7. **PATH CONVENTIONS**

- Use kebab-case for multi-word paths
- Use singular resource names in base path
- Use plural for collections
- Parameter names should be descriptive

## IMPLEMENTATION TEMPLATE:

```typescript
import { Router } from "ultimate-express";
import NameController from "../controllers/NameController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validation";
import { rateLimiter } from "../middlewares/rateLimit";

const router = Router();

// ================================
// PUBLIC ROUTES
// ================================

// Create resource
router.post(
  "/register",
  validateRequest("create"),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  NameController.create
);

// Authentication routes
router.post(
  "/login",
  validateRequest("login"),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  NameController.login
);

router.post(
  "/refresh-token",
  validateRequest("refreshToken"),
  NameController.refreshToken
);

// Public read routes
router.get("/public", NameController.getPublicData);
router.get("/public/:id", NameController.getPublicById);

// ================================
// PROTECTED ROUTES
// ================================

// Profile management
router.get("/profile", authMiddleware, NameController.getProfile);

router.put(
  "/profile",
  authMiddleware,
  validateRequest("updateProfile"),
  NameController.updateProfile
);

// Resource CRUD operations
router.get("/", authMiddleware, NameController.getAll);

router.get(
  "/:id",
  authMiddleware,
  validateRequest("getById"),
  NameController.getById
);

router.post(
  "/",
  authMiddleware,
  validateRequest("create"),
  NameController.create
);

router.put(
  "/:id",
  authMiddleware,
  validateRequest("update"),
  NameController.update
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest("delete"),
  NameController.delete
);

// ================================
// ADMIN ROUTES
// ================================

router.get(
  "/admin/stats",
  authMiddleware,
  adminMiddleware,
  NameController.getAdminStats
);

// ================================
// SESSION MANAGEMENT
// ================================

router.get("/sessions", authMiddleware, NameController.getSessions);

router.post("/logout", authMiddleware, NameController.logout);

router.post("/logout-all", authMiddleware, NameController.logoutAllDevices);

export default router;
```

## SPECIFIC ROUTE PATTERNS:

### 1. **Authentication Routes**

```typescript
// Registration
router.post(
  "/register",
  validateRequest("register"),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  UserController.register
);

// Login
router.post(
  "/login",
  validateRequest("login"),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  UserController.login
);

// Token refresh
router.post(
  "/refresh-token",
  validateRequest("refreshToken"),
  UserController.refreshToken
);

// Logout
router.post("/logout", authMiddleware, UserController.logout);

// Logout all devices
router.post("/logout-all", authMiddleware, UserController.logoutAllDevices);
```

### 2. **CRUD Routes**

```typescript
// CREATE
router.post(
  "/",
  authMiddleware,
  validateRequest("create"),
  ResourceController.create
);

// READ (List with pagination)
router.get("/", authMiddleware, ResourceController.getAll);

// READ (Single resource)
router.get(
  "/:id",
  authMiddleware,
  validateRequest("getById"),
  ResourceController.getById
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  validateRequest("update"),
  ResourceController.update
);

// PARTIAL UPDATE
router.patch(
  "/:id",
  authMiddleware,
  validateRequest("partialUpdate"),
  ResourceController.partialUpdate
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  validateRequest("delete"),
  ResourceController.delete
);
```

### 3. **Nested Resource Routes**

```typescript
// User posts
router.get("/users/:userId/posts", authMiddleware, PostController.getUserPosts);

// User posts by ID
router.get(
  "/users/:userId/posts/:postId",
  authMiddleware,
  PostController.getUserPostById
);

// Create user post
router.post(
  "/users/:userId/posts",
  authMiddleware,
  validateRequest("createUserPost"),
  PostController.createUserPost
);
```

### 4. **File Upload Routes**

```typescript
// Single file upload
router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("file"),
  FileController.uploadSingle
);

// Multiple files upload
router.post(
  "/upload-multiple",
  authMiddleware,
  uploadMiddleware.array("files", 5),
  FileController.uploadMultiple
);

// Avatar upload
router.post(
  "/avatar",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  UserController.uploadAvatar
);
```

### 5. **Search & Filter Routes**

```typescript
// Search resources
router.get(
  "/search",
  authMiddleware,
  validateRequest("search"),
  ResourceController.search
);

// Filter by category
router.get(
  "/category/:category",
  authMiddleware,
  ResourceController.getByCategory
);

// Advanced filters
router.post(
  "/filter",
  authMiddleware,
  validateRequest("filter"),
  ResourceController.filter
);
```

## MIDDLEWARE ORDER PATTERN:

```typescript
router.method(
  "/path",
  // 1. Rate limiting (if needed)
  rateLimiter(options),

  // 2. Authentication (if protected)
  authMiddleware,

  // 3. Authorization (if role-based)
  adminMiddleware,

  // 4. File upload (if needed)
  uploadMiddleware.single("file"),

  // 5. Validation
  validateRequest("schema"),

  // 6. Controller method
  Controller.method
);
```

## RATE LIMITING PATTERNS:

```typescript
// Strict rate limiting for sensitive operations
const strictRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many requests, please try again later",
});

// Standard rate limiting
const standardRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Apply to routes
router.post("/login", strictRateLimit, UserController.login);
router.post("/register", strictRateLimit, UserController.register);
router.get(
  "/profile",
  standardRateLimit,
  authMiddleware,
  UserController.getProfile
);
```

## PATH NAMING CONVENTIONS:

### ✅ **Good Path Names:**

```typescript
// RESTful resource paths
router.get("/users", UserController.getAll);
router.get("/users/:id", UserController.getById);
router.post("/users", UserController.create);

// Action-based paths
router.post("/users/login", UserController.login);
router.post("/users/logout", UserController.logout);
router.post("/users/refresh-token", UserController.refreshToken);

// Nested resources
router.get("/users/:userId/posts", PostController.getUserPosts);
router.get(
  "/categories/:categoryId/products",
  ProductController.getByCategoryId
);

// Kebab-case for multi-word
router.get("/user-preferences", UserController.getPreferences);
router.post("/password-reset", UserController.resetPassword);
```

### ❌ **Bad Path Names:**

```typescript
// Inconsistent naming
router.get("/getUsers", UserController.getAll); // ❌ Verb in path
router.post("/user_login", UserController.login); // ❌ Snake_case
router.get("/userPosts", PostController.getUserPosts); // ❌ CamelCase

// Non-RESTful paths
router.post("/doLogin", UserController.login); // ❌ Action prefix
router.get("/fetchUserData", UserController.getProfile); // ❌ Implementation detail
```

## ROUTE GROUPING EXAMPLE:

```typescript:src/routes/userRoutes.ts
import { Router } from 'ultimate-express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';
import { rateLimiter } from '../middlewares/rateLimit';

const router = Router();

// ================================
// AUTHENTICATION ROUTES
// ================================
router.post('/register',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  UserController.register
);

router.post('/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  UserController.login
);

router.post('/refresh-token', UserController.refreshToken);

// ================================
// PROFILE MANAGEMENT
// ================================
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.delete('/profile', authMiddleware, UserController.deleteProfile);

// ================================
// SESSION MANAGEMENT
// ================================
router.get('/sessions', authMiddleware, UserController.getSessions);
router.post('/logout', authMiddleware, UserController.logout);
router.post('/logout-all', authMiddleware, UserController.logoutAllDevices);

// ================================
// PASSWORD MANAGEMENT
// ================================
router.post('/forgot-password',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }),
  UserController.forgotPassword
);

router.post('/reset-password',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }),
  UserController.resetPassword
);

router.post('/change-password',
  authMiddleware,
  UserController.changePassword
);

export default router;
```

## REMEMBER: ROUTES = HTTP ENDPOINTS, CONTROLLERS = REQUEST HANDLERS!

📋 Routes Commit Checklist:
☐ File named [resource]Routes.ts
☐ Router imported from 'ultimate-express'
☐ Controller imported correctly
☐ Routes grouped by access level (public/protected)
☐ Middlewares applied in correct order
☐ RESTful path conventions followed
☐ Rate limiting on sensitive endpoints
☐ Clear comments separating route groups
☐ Export default router
☐ Consistent spacing and formatting

🔧 Quick Routes Template:

```typescript
import { Router } from 'ultimate-express';
import [NAME]Controller from '../controllers/[NAME]Controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// ================================
// PUBLIC ROUTES
// ================================

router.post('/action', [NAME]Controller.publicMethod);

// ================================
// PROTECTED ROUTES
// ================================

router.get('/', authMiddleware, [NAME]Controller.getAll);
router.get('/:id', authMiddleware, [NAME]Controller.getById);
router.post('/', authMiddleware, [NAME]Controller.create);
router.put('/:id', authMiddleware, [NAME]Controller.update);
router.delete('/:id', authMiddleware, [NAME]Controller.delete);

export default router;
```

This pattern ensures:

- **Consistency**: All routes follow same structure
- **Security**: Proper middleware application
- **Performance**: Rate limiting where needed
- **Maintainability**: Clear organization and comments
- **RESTful**: Standard HTTP conventions
- **Type Safety**: Works with ultimate-express types
