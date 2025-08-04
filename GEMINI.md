# Gemini Project Context

This document provides context about the `apilite` project for the Gemini AI model.

## Project Overview

`apilite` is a backend RESTful API template built with Node.js, Express.js (using the `ultimate-express` library for performance), and TypeScript. It includes features for authentication, user management, and database interaction. The project is designed to be a starting point for building robust and scalable APIs.

## Key Technologies

- **Web Framework:** `ultimate-express` (a high-performance, drop-in replacement for Express.js)
- **Language:** TypeScript
- **Database:** SQLite3 (for development), with `knex` as the SQL query builder and migration tool.
- **Authentication:** JSON Web Tokens (JWT) for securing routes.
- **Password Hashing:** `bcrypt`
- **Development Server:** `nodemon` for automatic server restarts.
- **Containerization:** Docker (`compose.yml`)

## Project Structure

The project follows a standard structure for Express.js applications:

```
src/
├── config/         # Application configuration
├── controllers/    # Business logic
├── database/       # Migrations and seeds
├── middlewares/    # Express middlewares
├── routes/         # API route definitions
└── index.ts        # Application entry point
```

## Important Scripts

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Builds the project for production.
- `npm run start`: Starts the production server.
- `npm run migrate`: Runs database migrations.
- `npm run migrate:rollback`: Rolls back the last database migration.
- `npm run seed`: Seeds the database with initial data.

## How to Run the Project

1.  **Install dependencies:** `npm install`
2.  **Set up environment variables:** Create a `.env` file in the root of the project and add the necessary variables (see `.env.example`).
3.  **Run migrations:** `npm run migrate`
4.  **Start the development server:** `npm run dev`

## API Endpoints

The `README.md` file contains a list of available API endpoints, including authentication and user-related routes.

## Coding Style and Conventions

- The project uses TypeScript for static typing.
- Follow the existing file and folder structure when adding new features.
- Use the `knex` query builder for all database interactions.
- Use the provided middleware for validation and authentication.
- Adhere to the RESTful API principles.
