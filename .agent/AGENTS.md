# AI Agent Instructions — Phronix

This file contains operational rules for AI agents working on `stopage-tauri`.

For the architectural model and system boundaries, read **`ARCHITECTURE.md`**.

---

## 1. Before Changing Code

Always:

1. Read the relevant existing implementation.
2. Search the repository for the current owner of the state/lifecycle you are changing.
3. Check existing public APIs before introducing a new abstraction.
4. Determine whether the architecture in question is already implemented, being migrated, or only a target design.
5. Make the smallest change that preserves existing ownership boundaries.

Do not assume a path, type, or abstraction exists just because it is described in `ARCHITECTURE.md`.

---

# 2. Ownership First

Before writing code, answer:

```text
Who owns this state?
Who owns this lifecycle?
Who owns this business rule?
Who owns this persistence?
Who exposes this API?
```

Do not introduce a second owner without a strong architectural reason.

---

# 3. Workspace Rules

The conceptual hierarchy is:

```text
Workspace / Workbench
        ↓
       Tab
        ↓
   EntryRuntime
        ↓
 Controller + Store
        ↓
       View
```

Rules:

- Do not let plugin code reach into Workspace/Tab internals.
- Prefer public system APIs such as `useCurrentNodeId()` over reading tab internals.
- Prefer existing Workbench/Workspace abstractions over direct Dockview manipulation.
- Do not create a second workspace state owner.
- Treat Dockview as a host/renderer, not the business owner of workspace state.

When the migration to Workbench abstractions is incomplete, follow the existing implementation while preserving the intended boundary.

---

# 4. Plugin Rules

Plugins must be independent.

Do:

```text
Plugin
  ↓
public System API / Plugin API
```

Do not:

```text
Plugin
  ↓
another-plugin/internal/...
```

Never bypass a missing public API with:

- deep imports
- `any`
- hidden global state

When a plugin needs a capability, first check whether the owning system/plugin already exposes it.

---

# 5. Node Rules

Remember:

```text
NodeKind
    = system concept

node_type
    = plugin concept
```

Do not move `NodeKind` into a plugin.

Do not make a Node know about:

- React
- Workspace
- Tab
- Dockview
- editor implementation
- canvas implementation

A Node describes domain/system data; rendering and runtime behavior belong elsewhere.

---

# 6. Runtime / Controller / Store Rules

Use:

```text
EntryRuntime
    ├── Store
    └── Controller
            ↓
          View
```

Rules:

- Controller is instance-scoped.
- Runtime owns Store/Controller lifecycle.
- Store is reactive state.
- Store is not the owner of arbitrary I/O/business orchestration.
- Controller receives/injects the Store.
- View subscribes to Store and calls Controller APIs.
- Do not make React components the hidden lifecycle owner.

---

# 7. Backend Rules

Preserve the direction:

```text
Tauri Adapter (src-tauri)
      ↓
 Application (backend)
      ↓
 Domain (backend)
      ↑
Infrastructure (backend)
```

### Tauri Adapter (`src-tauri/src/commands/`)

Commands are thin adapters.

Do not put:

- SQL
- business logic
- plugin logic
- workspace logic

inside commands.

### Domain (`backend/src/domain/`)

Must not import:

- `sqlx`
- SQLite
- Tauri
- infrastructure DTOs
- frontend/framework concerns

### Application (`backend/src/application/`)

Owns use-case orchestration.

Examples:

```text
create_node
update_name
update_content
```

Multi-repository workflows belong here.

### Infrastructure (`backend/src/infrastructure/`)

Owns:

- `sqlx`
- SQLite queries
- DB row structs
- persistence implementations

---

# 8. Node Link / Backlink Rules

Keep these concepts distinct:

```text
Node Link
    Node A → Node B

Backlink
    Nodes that point to the current Node
```

Do not create a second physical relationship table merely to represent backlinks unless there is a deliberate architectural reason.

The `node_links` relation can normally support both:

```text
forward links
    source_node_id = current

backlinks
    target_node_id = current
```

When modifying this area, inspect the existing repository/application interfaces first.

---

# 9. API Rules

Keep:

```text
tauriApi.*
    = backend / IPC capability

systemApi.*
    = Phronix system capability
```

Use the appropriate layer.

Do not make a component call raw Tauri IPC when an existing API already owns that capability.

---

# 10. Module Boundary Rules

Use module public APIs.

Prefer:

```typescript
import { x } from "../module/public";
```

Do not:

```typescript
import { x } from "../module/internal/deep/file";
```

Treat `public/` as a real architectural boundary.

---

# 11. Third-Party Library Rules

Meaningful external infrastructure should be isolated through the appropriate `lib/` boundary.

Examples:

- TipTap
- React Flow
- Dockview
- Lexical, if actually used

Do not spread third-party implementation details into domain/system concepts unnecessarily.

Do not wrap trivial dependencies just for the sake of wrapping them.

---

# 12. TypeScript Rules

- Strict typing.
- Avoid `any`.
- Prefer existing project types.
- Keep React components focused.
- Do not put backend business logic in components.
- Do not create duplicate state owners.
- Keep cross-plugin APIs typed.
- **Naming Convention for Plugins:** Always export a `TYPE` constant and type in `identity.ts` for nodes (e.g., `export const TYPE = "canvas"; export type TYPE = typeof TYPE;`).

---

# 13. Rust Rules

- Run `cargo fmt` after Rust changes.
- Run `cargo clippy` when appropriate.
- Use `thiserror` for domain errors.
- Use `anyhow` only where an application/integration-level untyped error is appropriate.
- Prefer compile-time checked `sqlx::query!` / `query_as!` where applicable.
- Use `async_trait` when required for async trait implementations.

---

# 14. Feature Workflow

## Backend Feature

Prefer:

```text
Domain
  ↓
Application
  ↓
Infrastructure
  ↓
Tauri adapter
  ↓
Frontend API/query
```

Only add an application use case when orchestration/business behavior warrants it.

## Node Plugin

Prefer:

```text
Plugin
  ↓
NodeConfig
  ↓
EntryRuntime
  ↓
Controller + Store
  ↓
View
```

Do not let the plugin reinvent tab/workspace management.

---

# 15. Verification Before Finalizing

After making a change:

1. Check imports and module boundaries.
2. Check ownership/lifecycle.
3. Check whether a new abstraction duplicates an existing one.
4. Run relevant type checking/tests/builds where practical.
5. Run `cargo fmt` / relevant Rust checks for backend changes.
6. Explain any architectural deviation instead of silently introducing it.

---

# 16. Conflict Resolution

When `AGENTS.md`, `ARCHITECTURE.md`, and the actual repository appear inconsistent:

```text
Actual implementation
        +
Established architecture
        +
Current migration state
```

must be inspected together.

Do not blindly rewrite working code to match a document.

Do not silently redefine architecture in one feature.

When uncertain, preserve existing boundaries and investigate the owner of the responsibility before changing it.
