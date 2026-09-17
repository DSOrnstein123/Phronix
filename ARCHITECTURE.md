# Phronix Architecture

This document is the canonical architectural reference for Phronix (`stopage-tauri`).

It describes system boundaries, ownership, lifecycle, dependency direction, and the main architectural concepts. It is intentionally separate from `AGENTS.md`, which contains operational instructions for AI agents.

> **Status note**
>
> Some parts of the architecture are established, while others are still being migrated toward the target design. When implementation and this document disagree, inspect the repository and determine whether the code is an older implementation, an in-progress migration, or a deliberate deviation before changing behavior.

---

## 1. System Overview

Phronix is a node-based knowledge management and productivity application.

### Stack

- **Desktop framework**: Tauri v2
- **Frontend**: React, Vite, TypeScript
- **State / data**: Zustand, TanStack Query
- **Styling / UI**: TailwindCSS, Radix-based primitives
- **Editor**: TipTap
- **Canvas / graph**: React Flow / `@xyflow/react`
- **Workspace host**: Dockview
- **Backend**: Rust
- **Database**: SQLite via `sqlx`

The core system concept is a `Node`.

A Node represents a system-level entity such as:

```text
Folder
File
Template
...
```

A Node can additionally have a plugin-owned `node_type`:

```text
document
canvas
flashcard
...
```

---

# 2. Node Model

## 2.1 NodeKind vs node_type

These are deliberately different concepts.

### NodeKind

`NodeKind` is a **system concept**.

Examples:

```text
file
folder
template
```

It belongs to the core/domain model.

### node_type

`node_type` identifies the plugin-owned behavior/type of a Node.

Examples:

```text
document
canvas
flashcard
pdf-reader
```

Plugins own `node_type`.

Plugins must not redefine `NodeKind`.

### Boundary

```text
System
  └── NodeKind

Plugin
  └── node_type
```

---

# 3. Backend Architecture

The backend follows **Hexagonal Architecture (Ports & Adapters)** with DDD-inspired domain modeling.

The dependency direction is:

```text
Tauri Adapter
      ↓
 Application
      ↓
   Domain
      ↑
Infrastructure ─── implements Domain ports
```

A more concrete flow is:

```text
Frontend
   ↓ IPC
Tauri command
   ↓
Application use case
   ↓
Domain ports
   ↑
Infrastructure implementations
   ↓
SQLite
```

---

## 3.1 Domain

Expected responsibility:

```text
backend/src/domain/
```

The domain contains:

- business models
- domain concepts
- repository/port traits
- domain errors

The domain must remain independent of infrastructure.

### Domain must not depend on

- `sqlx`
- SQLite-specific types
- Tauri
- HTTP frameworks
- frontend frameworks
- infrastructure DTOs/DB rows

Example ports:

```rust
pub trait NodeRepository { ... }

pub trait NodeLinkRepository { ... }
```

---

## 3.2 Application

Expected responsibility:

```text
backend/src/application/
```

The application layer contains **use cases and orchestration**.

Examples:

```text
create_node
update_name
update_content
```

The application layer is where workflows that span multiple capabilities should be coordinated.

Example:

```text
update_content
    ↓
update/persist content
    ↓
extract Node → Node references
    ↓
update node_links
```

The important rule is:

> Repositories persist data; application use cases coordinate multi-step workflows.

Link extraction therefore belongs to application orchestration rather than being hidden inside a concrete repository.

`update_content` is an example, not a rule that every future content-producing operation must enter through exactly that function.

---

## 3.3 Infrastructure

Expected responsibility:

```text
backend/src/infrastructure/
```

Infrastructure implements domain/application ports.

Examples:

```text
SqliteNodeRepository
```

Infrastructure owns:

- `sqlx`
- SQLite queries
- DB row structs
- DB-specific conversions
- persistence details

For example:

```text
DbNode
    ↓ conversion
Node
```

The domain model must not know the shape of `DbNode`.

---

## 3.4 Database

Expected responsibility:

```text
backend/src/database/
```

Contains:

- connection setup
- migrations
- database initialization

---

# 4. Tauri Adapter

Tauri commands are adapters between IPC and the backend/application layer.

Conceptually:

```text
IPC payload
    ↓
Tauri command
    ↓
application/backend capability
    ↓
serialized response
```

Commands should remain thin.

They should not contain:

- SQL
- business rules
- complex application orchestration
- workspace/plugin logic

---

# 5. Frontend Architecture

The frontend separates:

```text
Server / backend state
    → TanStack Query

Plugin instance state
    → Zustand Store

Business / instance behavior
    → Controller

Workspace state
    → Workbench / Workspace system

Rendering
    → React View
```

The goal is clear ownership.

Do not create multiple competing owners for the same state without a deliberate reason.

---

# 6. Plugin System

Phronix uses a plugin-oriented architecture.

A plugin is a system participant, not merely a collection of UI components.

The conceptual plugin kinds are:

| Kind        | DB data | Tab behavior                   | Example                         |
| ----------- | ------: | ------------------------------ | ------------------------------- |
| `Node`      |     Yes | Opens a content tab            | document, canvas, flashcard     |
| `Tool`      |      No | Opens its own tab              | file explorer, template manager |
| `Widget`    |      No | Injects into a slot            | template picker                 |
| `Auxiliary` |      No | Follows active content context | TOC, backlinks                  |
| `Service`   |      No | Exposes an API                 | editor/block infrastructure     |

Not every category needs to be equally mature in the current implementation.

The important architectural principle is:

> Choose the category that matches the responsibility instead of making every plugin a Node.

---

# 7. Plugin Registration

Plugins are intended to register through a declarative configuration/registry.

A representative shape is:

```typescript
interface PluginConfig {
  name: string;
  icon?: IconData;

  nodes?: Record<NodeType, NodeConfig>;
  tools?: Record<ToolType, ToolConfig>;
  widgets?: Record<string, WidgetConfig>;
  auxiliary?: Record<string, AuxiliaryConfig>;
  services?: Record<string, ServiceConfig>;

  actionButtons?: ActionButton[];
  commands?: PluginCommand[];

  api?: PluginApi;
  pluginDependencies?: PluginId[];

  contributes?: ContributionPoints;

  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
}
```

The exact fields must follow the current repository types. Do not introduce optional configuration solely because it appears in this conceptual model.

---

# 8. Workspace Architecture

The core workspace hierarchy is:

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

This is one of the most important boundaries in Phronix.

---

## 8.1 Workspace / Workbench

Workspace-level code owns workspace concerns such as:

- tabs
- active tab
- workspace navigation
- layout/regions
- workspace persistence where applicable

The target architecture is:

```text
WorkbenchManager / Workspace Engine
                ↓
       single source of truth
                ↓
             Dockview
             (renderer/host)
```

Therefore feature code should prefer workspace abstractions such as:

```text
openTab(...)
closeTab(...)
changeEntry(...)
```

rather than directly manipulating Dockview.

### Migration caveat

Dockview is currently part of the implementation, and the migration toward a stronger Workbench abstraction may not be complete everywhere.

When touching workspace code:

1. inspect the current implementation;
2. use an existing Workbench abstraction when available;
3. do not create a second competing workspace owner.

---

# 9. Tab

A Tab is the boundary between workspace management and an opened entry.

A Tab may own:

- the current entry/runtime
- active entry state
- navigation history
- tab-specific lifecycle

A plugin should not depend on the concrete Tab implementation.

Avoid plugin code such as:

```typescript
useTab();
tab.currentEntry.nodeId;
```

merely to access the current Node.

Prefer a system/public capability such as:

```typescript
useCurrentNodeId();
```

or the equivalent public API used by the current implementation.

The exact API can evolve.

The architectural rule does not:

> Plugins consume public system capabilities; they do not reach into Workspace/Tab internals.

---

# 10. EntryRuntime

`EntryRuntime` is the runtime representation/lifecycle boundary of an opened entry.

Conceptually:

```text
EntryRuntime
 ├── entry identity
 ├── Store
 └── Controller
```

The runtime is the lifecycle owner for an instance-specific Store/Controller pair.

This reflects the current design direction of **controller-per-instance**.

A controller should not secretly become a global singleton that stores all node-specific state.

Node/plugin configuration may supply factories, but lifecycle ownership should remain in the runtime/entry layer.

---

# 11. Controller / Store / View

The intended instance architecture is:

```text
EntryRuntime
    ├── Store
    └── Controller
            ↓
          View
```

## Store

Zustand Store = reactive state.

Rules:

- represents observable plugin state;
- does not own arbitrary I/O orchestration;
- does not own its own lifecycle.

## Controller

Controller = instance-level business/application behavior and I/O orchestration.

Rules:

- belongs to one entry/runtime instance;
- receives/injects its Store;
- can depend on appropriate services/API layers;
- exposes explicit operations to the View;
- should be testable without mounting React.

Conceptually:

```typescript
createController(store, services);
```

rather than making a controller extend or become the Zustand store.

## View

View = React rendering layer.

Views should:

- subscribe to the Store;
- call Controller APIs;
- render UI.

Views should not become the hidden owner of business logic or lifecycle.

---

# 12. Plugin Independence

A plugin may use another plugin's public API.

A plugin must not import another plugin's implementation internals.

Preferred:

```text
Plugin A
   ↓
Public Plugin API
   ↓
Plugin B
```

Forbidden architecture:

```text
Plugin A
   ↓
Plugin B/internal/...
```

This keeps plugins replaceable and prevents hidden coupling.

---

# 13. Cross-Plugin API

Cross-plugin APIs should be type-safe.

A public API registry may use TypeScript module augmentation:

```typescript
declare module "@system/plugin-manager/types" {
  interface PluginApiMap {
    "core.block-editor": {
      blockRegistry: BlockRegistry;
    };
  }
}
```

Consumer:

```typescript
const api = systemApi.plugins.getApi("core.block-editor");

api?.blockRegistry.register(...);
```

Do not use `any` to bypass missing API types.

---

# 14. Node Links and Backlinks

These concepts are related but not identical.

## Node Link

A Node Link is a directed relation:

```text
Node A ─────→ Node B
```

The persisted relation can be represented by:

```text
node_links
    source_node_id
    target_node_id
```

A typical uniqueness invariant is:

```text
(source_node_id, target_node_id)
```

## Backlink

A backlink is the reverse view of Node Links.

For Node B:

```text
Node A ─────→ Node B
          backlink of B
```

Therefore:

> Backlinks are the Nodes that point to the current Node.

Backlinks do not need to be a second physical relationship table merely because the UI displays them in reverse.

The same relation can support:

```text
forward links:
source_node_id = current node

backlinks:
target_node_id = current node
```

Application/repository APIs can expose these as distinct operations when useful:

```rust
get_forward_links(node_id)
get_backlinks(node_id)
```

without duplicating the underlying relationship.

---

# 15. Node Metadata vs Node Detail

Keep structural metadata conceptually separate from heavy content/detail data where the current backend model supports that distinction.

Example:

```text
NodeMetadata
    id
    name
    kind
    node_type
    parent_id
    ...

NodeDetail
    metadata
    content
    properties
    ...
```

Do not automatically place all links, content, or expensive derived information inside metadata because a screen happens to need it.

Let the owning use case/query compose the required result.

The goal is to avoid making ordinary metadata queries load unrelated content or relationship data.

---

# 16. API Separation

Keep these concepts separate:

```text
tauriApi.*
    = raw backend / Tauri IPC capabilities

systemApi.*
    = Phronix system capabilities
      (workspace, plugins, entries, editor infrastructure, etc.)
```

Examples:

```text
"Give me node content from the database"
    → tauriApi / backend data layer

"What node is currently active?"
    → systemApi / workspace layer

"Open this entry"
    → systemApi / workspace layer
```

A component should not bypass an existing system abstraction by dropping down to raw IPC.

---

# 17. Module Boundaries

## 17.1 `public/`

`public/` is the module API boundary.

Cross-module consumers should import through the public entry point.

Prefer:

```typescript
import { x } from "../other-module/public";
```

over:

```typescript
import { x } from "../other-module/internal/deep/file";
```

If a capability is not exported publicly, treat that as an intentional boundary signal.

---

## 17.2 `lib/`

`lib/` isolates meaningful third-party infrastructure.

Examples:

- TipTap
- React Flow
- Dockview
- Lexical, if actually used

Conceptually:

```text
lib/<library>/
    public/
```

Feature code should consume the project's abstraction where one exists.

Do not add wrappers around trivial dependencies purely for ceremony. The purpose is to isolate replaceable infrastructure and prevent external-library details from spreading through feature/business code.

---

# 18. Dependency Direction

The architecture should generally flow inward toward stable concepts.

Backend:

```text
Tauri adapter
      ↓
Application
      ↓
Domain
```

Infrastructure implements inward-facing ports:

```text
Infrastructure
      ↓ implements
Domain ports
```

Frontend:

```text
View
 ↓
Controller / System API
 ↓
Store / Services
 ↓
Infrastructure / backend API
```

Plugins should depend on **public system APIs**, not concrete host internals.

---

# 19. Architectural Ownership Questions

Before introducing a new state, service, or abstraction, identify:

```text
Who owns this state?

Who owns this lifecycle?

Who owns this business rule?

Who owns this persistence?

Who exposes this API?
```

If two layers appear to own the same responsibility, stop and inspect the existing architecture before adding another abstraction.

---

# 20. Third-Party Editor / Canvas / Workspace Integration

Third-party libraries are infrastructure concerns.

Examples:

```text
TipTap
React Flow
Dockview
```

The feature/domain model should not become coupled to those libraries unnecessarily.

For example, a Node should not contain React Flow nodes or Dockview tab objects merely because a Node is rendered by those systems.

The conceptual model should remain:

```text
Node
    ↓
Plugin / Entry
    ↓
Runtime
    ↓
Third-party renderer
```

rather than:

```text
Node
    └── Dockview/ReactFlow/Tiptap internals
```

---

# 21. Architectural Invariants

These are the most important rules to preserve:

```text
Node does not know UI / Workspace / Tab / Dockview.

Plugin does not know Workspace/Tab internals.

EntryRuntime owns instance lifecycle.

Controller is instance-scoped.

Store is reactive state, not the business-service owner.

Tauri commands are adapters, not business logic.

Domain does not know sqlx/SQLite.

Repositories persist; application use cases orchestrate.

Node Links represent directed Node → Node relationships.

Backlinks are reverse queries/views over Node Links.

Cross-module access goes through public APIs.

Cross-plugin access goes through typed public APIs.

Third-party infrastructure should not leak through the whole feature architecture.
```

These invariants are more important than any particular filename or framework detail.
