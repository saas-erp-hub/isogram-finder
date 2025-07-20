# Development Guidelines

This document contains critical information about working with this codebase. Follow these guidelines precisely.

## Core Development Rules

1. Package Management
   - ONLY use `uv` for dependency management.
   - Installation: `uv pip install -r requirements.txt` (to install all dependencies listed in `requirements.txt`).
   - For adding new packages: Manually add the package and version to `requirements.txt`, then run `uv pip install -r requirements.txt`.
   - Running tools: `uv run <tool>`
   - Upgrading: Update the version in `requirements.txt` and run `uv pip install -r requirements.txt`.
   - FORBIDDEN: Direct `pip install` (always use `uv pip install`), `@latest` syntax in dependency files.

2. Code Quality
   - Type hints required for all code
   - Public APIs must have docstrings
   - Functions must be focused and small
   - Follow existing patterns exactly
   - Line length: 88 chars maximum

3. Testing Requirements
   - Framework: `uv run pytest`
   - Async testing: use anyio, not asyncio
   - Coverage: test edge cases and errors
   - New features require tests
   - Bug fixes require regression tests

4. Code Style
    - PEP 8 naming (snake_case for functions/variables)
    - Class names in PascalCase
    - Constants in UPPER_SNAKE_CASE
    - Document with docstrings
    - Use f-strings for formatting

When crafting commit messages, adhere to the following:
- For commits fixing bugs or adding features based on user reports, include a trailer:
  ```bash
  git commit --trailer "Reported-by:<name>"
  ```
  Where `<name>` is the name of the user.
- For commits related to a GitHub issue, include a trailer:
  ```bash
  git commit --trailer "Github-Issue:#<number>"
  ```
- Avoid mentioning co-authors or the tool used to create the commit message/PR. Focus on the content and purpose of the change.

## Development Philosophy

- **Simplicity**: Write simple, straightforward code
- **Readability**: Make code easy to understand
- **Performance**: Consider performance without sacrificing readability
- **Maintainability**: Write code that's easy to update
- **Testability**: Ensure code is testable
- **Reusability**: Create reusable components and functions
- **Less Code = Less Debt**: Minimize code footprint

## Coding Best Practices

- **Early Returns**: Use to avoid nested conditions
- **Descriptive Names**: Use clear variable/function names (prefix handlers with "handle")
- **Constants Over Functions**: Use constants where possible, especially for fixed values that do not require computation or complex logic. This improves readability and maintainability.
- **DRY Code**: Don't repeat yourself
- **Functional Style**: Prefer functional, immutable approaches when not verbose
- **Minimal Changes**: Only modify code related to the task at hand
- **Function Ordering**: Prefer defining composing functions before their components when it improves readability and logical flow. This is a guideline, not a strict rule, and can be adapted based on context.
- **TODO Comments**: Mark issues in existing code with "TODO:" prefix
- **Simplicity**: Prioritize simplicity and readability over clever solutions
- **Build Iteratively** Start with minimal functionality and verify it works before adding complexity
- **Run Tests**: Test your code frequently with realistic inputs and validate outputs
- **Build Test Environments**: Create testing environments for components that are difficult to validate directly
- **Functional Code**: Use functional and stateless approaches where they improve clarity
- **Clean logic**: Keep core logic clean and push implementation details to the edges
- **File Organization**: Balance file organization with simplicity - use an appropriate number of files for the project scale
- **Robuste Dateibearbeitung**: Bei komplexen Änderungen an Dateien, insbesondere wenn das `replace`-Tool aufgrund von Zeilenumbrüchen oder Leerzeichen fehlschlägt, ist es am besten, die gesamte Datei in den Speicher zu lesen, die Änderungen programmgesteuert vorzunehmen und dann die gesamte Datei zurückzuschreiben. Dies gewährleistet die Konsistenz und vermeidet Endlosschleifen durch nicht übereinstimmende `old_string`-Parameter.

## System Architecture

The project follows a client-server architecture:
- **Frontend:** A simple HTML page for user interaction.
- **Backend:** A Python application built with FastAPI, providing the core logic for the MFSK modem.

## Core Components

This section outlines the main components of the project. Please ensure this section is kept up-to-date with any significant changes to the project structure or key files.

- `backend/main.py`: FastAPI application entry point, defines API endpoints.
- `backend/modem_mfsk.py`: Implements the MFSK modem, including modulation, demodulation, packetization, and Reed-Solomon Forward Error Correction (FEC).
- `backend/tests/`: Unit tests for the backend logic.
- `frontend/index.html`: The main HTML file for the user interface.

## Pull Requests

- Create a detailed message of what changed. Focus on the high level description of
  the problem it tries to solve, and how it is solved. Don't go into the specifics of the
  code unless it adds clarity.

- Always add `ArthurClune` as reviewer.

- NEVER ever mention a `co-authored-by` or similar aspects. In particular, never
  mention the tool used to create the commit message or PR.

## Tooling and Quality Assurance

This project enforces strict adherence to its defined tooling and quality standards. Consistent application of these tools is crucial for maintaining code quality and project consistency.

### Python Tooling

1. **Package Management (uv only):**
   - ONLY use `uv`, NEVER `pip`.
   - Installation: `uv add package`
   - Running tools: `uv run tool`
   - Upgrading: `uv add --dev package --upgrade-package package`
   - FORBIDDEN: `uv pip install`, `@latest` syntax.

2. **Code Formatting (Ruff):**
   - Format: `uv run ruff format .`
   - Check: `uv run ruff check .`
   - Fix: `uv run ruff check . --fix`
   - Critical issues:
     - Line length (88 chars)
     - Import sorting (I001)
     - Unused imports
   - Line wrapping:
     - Strings: use parentheses
     - Function calls: multi-line with proper indent
     - Imports: split into multiple lines

3. **Type Checking (Pyright):
   - Tool: `uv run pyright`
   - Requirements:
     - Explicit `None` checks for `Optional` types.
     - Type narrowing for strings.
     - Version warnings can be ignored if checks pass.

4. **Pre-commit Hooks:**
   - Config: `.pre-commit-config.yaml`
   - Runs: Automatically on `git commit`.
   - Tools: Prettier (YAML/JSON), Ruff (Python).
   - Ruff updates:
     - Check PyPI versions.
     - Update config `rev`.
     - Commit config first.

### Testing Requirements

1. **Framework:** `uv run pytest` (for Python backend).
2. **Async Testing:** Use `anyio`, not `asyncio`.
3. **Coverage:** Test edge cases and errors.
4. **New Features:** Require tests.
5. **Bug Fixes:** Require regression tests.
6. **Robust SQL Assertions:** When testing dynamically generated SQL (especially complex `MERGE` statements), normalize both expected and actual SQL strings (remove all whitespace/newlines, convert to lowercase) and check for the presence of key components rather than exact string matches. Use helper functions for extraction and normalization.
7. **Mocking Database Rows:** For `pyodbc.Row` objects (or similar), create simple mock classes that can dynamically set attributes to simulate behavior (e.g., `MockRow(Change="UPDATE", Count=1)`).

### Quality Assurance Philosophy

- **Tests as a Safety Net:** Tests confirm the correctness of the main code and provide a crucial safety net, ensuring that future changes do not introduce regressions. They significantly improve code quality, data integrity, and maintainability.
- **Continuous Enhancement:** We continuously work to enhance our quality assurance. Future plans include:
  - **End-to-End (E2E) Tests:** Simulate full user flows (UI interaction to database verification) to catch integration errors. Tools: Playwright, Selenium.
  - **Stricter CI/CD Quality Gates:** Enforce linting, formatting, and type checking in the CI pipeline to prevent merging code that fails these checks.
  - **Performance Tests:** Stress-test the application with large datasets to identify bottlenecks and ensure scalability.
  - **Security Scanning:** Integrate tools (e.g., `pip-audit`, Snyk) to check for known vulnerabilities in dependencies.

## Troubleshooting and Common Issues

### Agent Interaction Learnings

- **Frontend UI/UX Refinement:** Iterative changes to `frontend/index.html` and associated JavaScript to improve user experience, including:
  - Translating UI elements from German to English.
  - Ensuring button functionality (e.g., "Choose File" triggering file input).
  - Streamlining the layout by removing redundant elements (modem type dropdowns, MFSK mode dropdown for decode) and simplifying the structure.
  - Displaying the selected filename for better user feedback.

- **Backend API Parameter Handling:** The issue where the `decode_signal` endpoint was still expecting a `mode` parameter, even after the frontend UI for it was removed, leading to decoding errors. This highlighted the importance of:
  - Synchronizing frontend and backend API expectations.
  - Verifying API endpoint signatures and their interaction with core logic.

- **Git History Management:** Covered amending the last commit to correct author information, understanding the implications of `git push --force` and `git push --force-with-lease`, and using `git filter-branch` to rewrite history and remove sensitive data (unoptimized images, real name) from older commits. This is a critical learning about maintaining privacy and repository cleanliness.

- **Image Optimization for Documentation:** The importance of optimizing images (resizing, quality reduction) for `README.md` to improve load times and repository size, and the use of `ImageMagick` for this purpose.

- **Local Markdown Preview:** The need for a local Markdown previewer (like VS Code's built-in one) to verify the rendering of `README.md` with local images before pushing to GitHub.

This section provides guidance on resolving common development issues, drawing from past project experiences.

### General Debugging Strategies

- **Systematic Debugging:** Employ systematic debugging techniques to trace data flow and inspect values at each transformation step. Ensure the backend generates informative error messages and logs.
- **Representative Test Data:** Use representative test files (e.g., Excel) that include both valid and erroneous data to test the robustness of conversion logic.
- **SQL Validation:** Always review generated SQL statements for syntax and logical correctness before execution.
- **FastAPI Exception Handling:**
    - **Lesson:** Specific `HTTPException`s can be unintentionally caught by a broad `except Exception:` block, masking the true error and returning a generic 500 status code instead of the intended 4xx code.
    - **Action:** In API endpoint handlers, always place handlers for specific exceptions (e.g., `except HTTPException as he: raise he`) *before* the generic `except Exception:`. This ensures specific, informative HTTP errors are returned to the client.

- **FastAPI `Content-Disposition` Header for File Downloads:**
    - **Lesson:** When serving files for download, the `Content-Disposition` header's `filename` parameter requires careful handling, especially for filenames containing spaces or special characters. Incorrect formatting can lead to broken or unexpected filenames on the client side.
    - **Action:** Always quote the filename in the `Content-Disposition` header. For example, use `filename="{secure_filename(your_filename)}"` to ensure proper handling by browsers.

### Common Python Issues

1. **Syntax Errors (Unterminated Strings, Unclosed Brackets):**
   - **Lesson:** These often stem from simple typos. Perform precise, line-by-line inspection around the reported line number. The error might be in the preceding line.
   - **Action:** Use `read_file` to get the exact code context. Correct iteratively.

2. **Mocking Pitfalls (`unittest.mock.InvalidSpecError`, `TypeError: unhashable type: 'list'` in mocks):**
   - **Lesson:** When a class is already mocked with `@patch`, use the mocked class directly instead of creating a new `MagicMock` with `spec` of the mocked class. Ensure parameters match expected types (e.g., a string column name vs. a list of tuples).

3. **Pydantic Model Attribute Shadowing and `**kwargs` Interaction (`TypeError: got multiple values for argument ...`, `UserWarning: Field name "..." shadows an attribute...`):**
    - **Lesson:** This error occurs when a function receives the same argument twice—once as a positional or keyword argument, and a second time inside the `**kwargs` dictionary. This is a common pitfall during major refactoring, especially when adding flexibility for new features (like multi-database support).
    - **Action:** The resolution required multiple iterative fixes. The final, stable pattern is:
        1. At the API boundary (e.g., in `main.py`), unpack the entire Pydantic model into keyword arguments: `importer.process_and_import(**body.model_dump())`.
        2. The top-level function in the business logic layer (`importer.py`) accepts `**kwargs`.
        3. This function then calls its helper functions using *explicit* keyword arguments, extracting them from the `kwargs` dictionary. This prevents passing arguments multiple times.

4. **Line Length:**
   - **Action:** Break strings with parentheses, use multi-line function calls, split imports.

5. **Types:**
   - **Action:** Add `None` checks, narrow string types, match existing patterns.

6. **F-string Escaping for Dynamic String Generation (e.g., SQL):**
    - **Lesson:** When constructing dynamic strings, especially SQL queries with f-strings, correctly escaping embedded quotes (single or double) is crucial to prevent `SyntaxError: unterminated f-string literal` or SQL injection vulnerabilities.
    - **Action:** Use appropriate escaping mechanisms (e.g., `val.replace("'", "''")` for single quotes in SQL) or parameterized queries where possible. Always test dynamic string generation thoroughly.
