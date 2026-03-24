### Claude Backend Rules

Rules for backend development

## Logs, Errors, and Debugging

- Log important events with context (e.g. user actions, API calls, errors).
- Use structured logging where possible (e.g. JSON) for better search and analysis.
- Log at appropriate levels (e.g. info for normal operations, warn for recoverable issues, error for critical failures).
- Avoid logging sensitive information (e.g. API keys, personal data).
- For debugging, reproduce the issue locally, check logs for clues, review recent changes, identify root cause, fix the cause (not just symptoms), and verify no regressions.
- Never guess fixes, apply blind patches, or change multiple systems at once when debugging.
- For API responses, provide clear error messages and use appropriate HTTP status codes.

## Code Style and Best Practices

- Write clean, readable, and maintainable code.
- Follow established design patterns and principles (e.g. SOLID, DRY).
- Use consistent naming conventions and formatting.
- Avoid premature optimization; focus on correctness and clarity first.
- Write modular code with clear separation of concerns.
- Document complex logic and public interfaces with comments and docstrings.
- Use type annotations and static analysis tools to catch errors early.
- Write unit tests for critical logic and edge cases.
- Use code reviews to maintain quality and share knowledge.
