# STAGE 1 — Clean and Stabilize the Existing App

Upgrade the existing CampusConnect project based on the audit in `docs/PROJECT_AUDIT.md`.

## Objective
Create a stable foundation without changing the backend architecture or breaking existing functionality.

## Tasks

### 1. Centralize API configuration
- Create a centralized API configuration/service.
- Remove duplicated backend URLs from individual screens.
- Use one configurable base URL.
- Keep environment-specific configuration outside screen components.
- Do not put passwords, API secrets, or private credentials inside the mobile application.
- Do not invent a new authentication mechanism.
- If existing authentication is insecure or unclear, document it and ask before changing the backend contract.

### 2. Improve API request handling
Create reusable request methods where appropriate.

Handle:
- Network failures
- Non-success HTTP responses
- Invalid or unexpected response data
- Request loading states
- User-friendly error messages

Do not silently hide errors.

### 3. Improve navigation
- Preserve the existing navigation flow where practical.
- Ensure every screen has a clear purpose.
- Prevent navigation to screens with missing required parameters.
- Give screens consistent titles and navigation behavior.

### 4. Fix existing bugs
Use the audit to fix confirmed issues such as:
- Incorrect API addresses
- Missing imports
- Empty message handling
- Image picker cancellation handling
- Unsafe access to undefined response data
- Duplicate participant selection
- Missing refresh after sending messages

Only fix issues that are confirmed in the source.

### 5. Code organization
Gradually organize code into:
- screens
- components
- services
- navigation
- utils
- config

Do not move everything unnecessarily. Update imports carefully.

## Viva-friendly comments
Add meaningful comments to important functions and logic.

For each important function, explain:
- What it does
- Why it exists
- How it works
- What input it receives

Do not add comments that simply repeat individual lines.

## Verification
- Run the project's available linting or validation commands.
- Run the application.
- Verify existing screens still open.
- Verify existing API operations still work where the backend is available.

Update `docs/VIVA_NOTES.md` with explanations of the changes.

Do not start optional new features until this stage is stable.

At the end, report changed files, bugs fixed, tests performed, and any remaining issues.