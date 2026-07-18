# APC-V1 Launch Bootstrap

- Code-backed definitions: settings definitions, background job definitions, resilience policies, provider capability registry and marketplace capability registry.
- Environment-backed definitions: production secrets, API credentials, storage credentials, JWT secrets and initial bootstrap administrator credentials.
- Database-backed defaults: administrator user when `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are provided, plus required default publishing categories.

Run the bootstrap with secure environment values. It is idempotent and does not create duplicate categories or users.
