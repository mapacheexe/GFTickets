# GFTickets

Frontend repository for the **GFTicket** project. It holds the client-side implementations of the application.

## Repository structure

```
GFTicket-Frontend/
├── gfticket-react/     # React implementation
├── gfticket-angular/   # Angular implementation
└── .github/workflows/  # CI workflows (commit-lint)
```

> Both `gfticket-react` and `gfticket-angular` are currently placeholders (empty except for `.gitkeep`), awaiting each project's initial setup.

## Commit conventions

This repository follows [Conventional Commits](https://www.conventionalcommits.org/), enforced automatically via GitHub Actions ([`commit-lint.yml`](.github/workflows/commit-lint.yml)) on every pull request targeting `main`.

Expected format:

```
<type>(<optional scope>): <description>
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.

Examples:

```
feat: add ticket creation form
fix(react): fix email field validation
chore: update dependencies
```

## License

ISC