# Security Policy

Security is a core requirement of this project.

## Reporting a Security Issue

Do not publish sensitive security vulnerabilities in a public GitHub issue.

Report them privately to the project owner.

## Sensitive Information

Never commit or share:

- API keys
- Passwords
- Access tokens
- Private keys
- Seed phrases
- Database credentials
- OAuth secrets
- Push-notification private keys
- Production environment files

## Project Security Rules

- Keep secrets in environment variables.
- Use `.env.example` only for empty placeholders.
- Apply least-privilege access to services and databases.
- Validate all external input.
- Protect admin routes with server-side authorization.
- Keep dependencies updated and reviewed.
- Use HTTPS in production.
- Record security-sensitive administrative actions.
- Never request wallet seed phrases, private keys, or exchange trading keys.

## Supported Versions

The project is still in early development. Only the latest version of the `main` branch will receive security updates.