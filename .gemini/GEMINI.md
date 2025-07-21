# Development Guidelines

This document contains critical information about working with this codebase. Follow these guidelines precisely.

## Core Development Rules

1.  **Package Management:**
    *   Use `npm` for dependency management.
    *   Installation: `npm install`
    *   Adding a new package: `npm install <package-name>`
    *   Adding a new dev package: `npm install <package-name> --save-dev`

2.  **Code Quality & Style:**
    *   Follow the existing code style and conventions.
    *   Use Prettier for consistent code formatting.
    *   Use ESLint for identifying and fixing code quality issues.
    *   Type hints (TypeScript) are required for all new code.
    *   Function and component names should be in `PascalCase`.
    *   Variable and function names should be in `camelCase`.
    *   Constants should be in `UPPER_SNAKE_CASE`.

3.  **Testing Requirements:**
    *   Framework: Jest and React Testing Library.
    *   Run tests with `npm test`.
    *   New features require corresponding tests.
    *   Bug fixes should include regression tests.

## Development Philosophy

-   **Simplicity**: Write simple, straightforward code.
-   **Readability**: Make code easy to understand.
-   **Maintainability**: Write code that's easy to update.
-   **Testability**: Ensure code is testable and well-covered.
-   **Reusability**: Create reusable components and functions.

## Coding Best Practices

-   **Component-Based Architecture**: Break down the UI into small, reusable components.
-   **State Management**: Use React's built-in state management (`useState`, `useReducer`) for local component state. For global state, consider React Context or a dedicated state management library if the application scales.
-   **Functional Components & Hooks**: Prefer functional components and hooks over class-based components.
-   **DRY Code**: Don't repeat yourself.
-   **Minimal Changes**: Only modify code related to the task at hand.

## System Architecture

The project is a client-side single-page application (SPA) built with React and TypeScript.

-   **Frontend:** A React application responsible for the user interface and all application logic.
-   **Core Components:**
    -   `src/IsogramFinder.tsx`: The core component for the isogram finding logic.
    -   `src/App.tsx`: The main application component that orchestrates the UI.
    -   `src/App.test.tsx`: Tests for the main application component.

## Pull Requests

-   Create a detailed message of what changed. Focus on the high-level description of the problem it tries to solve and how it is solved.

## Troubleshooting and Common Issues

### Agent Interaction Learnings

*(This section can be used to document key learnings from interactions with AI assistants, helping to improve future collaboration.)*

-   **GitHub Readiness:** Learned the importance of standard repository files like `LICENSE`, `README.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` for preparing a project for public release.
-   **README Content:** A good `README.md` should include a project description, features, screenshots, setup instructions, project structure, and future plans.
-   **Context is Key:** Providing a reference project was crucial for understanding the desired quality and structure of the documentation.