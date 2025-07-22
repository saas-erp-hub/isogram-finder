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

The project is a client-side single-page application (SPA) built with React and TypeScript. It offloads all performance-intensive computations to a Web Worker to ensure the UI remains responsive.

-   **Frontend:** A React application responsible for the user interface and state management. It sends search commands to the worker and displays the results it receives.
-   **Web Worker (`src/search.worker.ts`):** The computational core of the application. It handles all heavy logic, including:
    -   Parsing and cleaning the raw wordlist.
    -   The backtracking algorithm for finding isogram combinations.
    -   Scoring the found solutions.
    -   Sending throttled progress and result updates back to the main thread.
-   **Core Components:**
    -   `src/IsogramFinder.tsx`: The main UI component that manages user input, settings, and the display of search results. It communicates with the Web Worker.
    -   `src/App.tsx`: The root application component.
    -   `src/worker-loader.ts`: A helper to abstract the creation of the web worker.

## Pull Requests

-   Create a detailed message of what changed. Focus on the high-level description of the problem it tries to solve and how it is solved.

## Troubleshooting and Common Issues

### Agent Interaction Learnings

*(This section can be used to document key learnings from interactions with AI assistants, helping to improve future collaboration.)*

-   **GitHub Readiness:** Learned the importance of standard repository files like `LICENSE`, `README.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md` for preparing a project for public release.
-   **README Content:** A good `README.md` should include a project description, features, screenshots, setup instructions, project structure, and future plans.
-   **Context is Key:** Providing a reference project was crucial for understanding the desired quality and structure of the documentation.
-   **Web Worker Data Flow:** When implementing a web worker for performance-critical tasks, the most robust pattern is for the worker to handle all heavy computation and send back a complete, raw dataset. The main UI thread should be responsible for all sorting, filtering, and slicing of the data for display. Sending pre-sorted or pre-filtered data from the worker can lead to UI inconsistencies (e.g., a "sort by length" toggle not working) because the UI never has access to the full context of the results. Throttling updates from the worker is crucial, but it's better to send the full dataset periodically than a pre-processed slice.
-   **TypeScript and Webpack Loaders:** When using a webpack-specific loader syntax like `worker-loader!` in a TypeScript project, `tsc` will fail because it doesn't understand this syntax. The solution is to create a custom type declaration file (e.g., `custom.d.ts`) in the `src` directory to declare the module, allowing TypeScript to correctly interpret the import.
-   **ESLint `no-restricted-globals`:** The `self` keyword is the correct way to reference the global scope within a Web Worker. If ESLint flags this with `no-restricted-globals`, the correct fix is to disable the rule for that specific line with an `// eslint-disable-next-line no-restricted-globals` comment, as it's a valid use case.