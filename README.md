# golinks

A fast, self-hosted URL shortener for internal links, built with [Bun](https://bun.com).

## Features

- Self-hosted go-link server (e.g., `go/github` redirects to GitHub)
- Short aliases (e.g., `go/mm/gh` for MyMileage GitHub)
- Configurable via `shortcuts.toml` — no code changes needed
- Hot reload links without restarting the server
- Automatic HTTPS prefixing

## Installation

```bash
bun install
```

## Configuration

Edit `shortcuts.toml` to define your links:

```toml
[Links]
[Links.MyProject]
"myproject/github" = { link = "https://github.com/myorg/myproject", key = "key.myproject/github" }

[Keys]
[Keys.MyProject]
"key.myproject/github" = "mp/gh"
```

### Structure

- **Links**: Define full paths and their destinations
  - `path`: The URL path after `go/` (e.g., `myproject/github`)
  - `link`: The destination URL
  - `key`: Internal identifier for creating aliases

- **Keys**: Create short aliases pointing to existing links
  - Maps an internal key to a shorthand alias

## Usage

```bash
bun run index.ts
```

The server starts on `http://127.0.0.1:80`.

### Endpoints

- `go/<path>` — Redirects to the configured URL, or returns 404 if not found
- `go/reload` — Relinks configuration from `shortcuts.toml` without restarting

## Examples

Given the default configuration:

| URL | Redirects to |
|-----|--------------|
| `go/mymileage/github` | https://github.com/ygllc/MyMileage |
| `go/fetalkick/github` | https://github.com/ygllc/FetalKick |
| `go/mm/gh` | https://github.com/ygllc/MyMileage |
| `go/mm/j` | https://ygllc.atlassian.net/jira/software/projects/MILEAGE/summary |
| `go/fk/gh` | https://github.com/ygllc/FetalKick |

## Requirements

- [Bun](https://bun.com) v1.3.7+
