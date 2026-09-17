---
name: system-design
description: >-
  Guidelines for system design and architecture workflows. Use this skill whenever the user asks to design a new feature, evaluate architecture, establish API boundaries, or plan a database schema.
---

# System Design Workflow

When the user requests to design a system or a new feature, follow these steps strictly:

## 1. Requirement Clarification

- Do not write code immediately.
- Ask the user to clarify:
  - Expected data volume and scale.
  - Read/Write ratio.
  - Performance/latency constraints and edge cases.

## 2. High-Level Design (HLD)

- Use Mermaid diagrams to visualize components, architecture, and data flow.
- Clearly define API endpoints, payloads, and Data Transfer Objects (DTOs).
- Present trade-offs for key decisions (e.g., SQL vs NoSQL, monolith vs microservices, sync vs async communication, consistency vs availability) with a brief rationale for the recommended choice.

## 3. Database Design (Data Model)

- Propose table schemas for relational databases or document structures for NoSQL.
- Identify necessary indexes based on expected query patterns.

## 4. Await Feedback

- Request the user's review and approval on the design document before proceeding with any specific source code implementation.

## 5. When to skip this workflow

- Minor changes to existing schema/API that don't affect scale or contracts.
- User explicitly asks for a quick prototype, not production design.
