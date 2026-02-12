MERN AI Deterministic UI Generator

A deterministic AI-powered UI generator built with the MERN stack.
It creates and modifies React interfaces using a fixed component system and a structured multi-agent pipeline.

# Architecture View 
High-Level Flow

User Prompt
→ Planner Agent
→ Generator Agent
→ Explainer Agent
→ MongoDB Version Storage
→ Frontend Live Preview

rontend (React)

The frontend is split into three main panels:

Chat Panel – User enters UI request or modification

Code + Preview Panel – Shows generated React code and live render

Explanation Panel – Displays AI reasoning

The frontend communicates with the backend through REST APIs:

POST /api/generate

POST /api/iterate

POST /api/rollback

GET /api/history

Backend (Express)

The backend is structured around a controlled AI pipeline:

Planner Agent

Generator Agent

Explainer Agent

Validation Layer

MongoDB Version Storage

Each request moves sequentially through this pipeline.

Database (MongoDB)

MongoDB stores:

Version number

Structured plan

Generated React code

Explanation text

Timestamp

This allows rollback and deterministic history tracking.

# Agent Design & Prompts

The system uses three specialized agents. Each has a strict responsibility.

🧠 Planner Agent

Goal: Convert natural language into a structured UI plan.

In New UI Mode:

Creates full component hierarchy

Defines layout and ordering

Assigns component props

In Apply Changes Mode:

Loads previous plan

Modifies only requested components

Preserves untouched structure

Prompt Strategy:

Explicit whitelist of allowed components

Clear prohibition of HTML tags

Structured JSON-only output

Deterministic formatting rules

The Planner never generates React code — only structured plans.

⚙️ Generator Agent

Goal: Convert structured plan into valid React code.

In New UI Mode:

Generates full React component

Imports only approved components

In Apply Changes Mode:

Compares previous plan and new plan

Updates only modified components

Leaves untouched code identical

Prompt Strategy:

No inline styles

No custom components

No HTML elements

Strict import enforcement

Deterministic ordering of components

Output must be pure React code only.

🗣 Explainer Agent

Goal: Provide human-readable explanation.

In New UI Mode:

Explains layout decisions

Explains component choices

In Apply Changes Mode:

Lists exact modifications

Confirms unchanged components

Prompt Strategy:

Never include code

No technical implementation details

Focus on reasoning and changes only

# Component System Design
The system uses a fixed, immutable UI library of 8 components:

Button
Card
Input
Table
Modal
Sidebar
Navbar
Chart

Design Principles
1. Determinism

Only predefined components are allowed.
No runtime styling or dynamic CSS.

2. Security

No <div>, <span>, <p>

No inline styles

No external libraries

No CSS-in-JS

3. Composition Over Customization

UI flexibility comes from:

Component composition

Prop configuration

Component ordering

Not from creating new components.

# Known Limitations

1.Limited design flexibility
Only 8 components restrict UI complexity.

2.No fine-grained styling
No custom colors, spacing, or layout control.

3.Limited layout logic
Complex responsive behaviors are not supported.

4.Deterministic rigidity
Strict rules reduce creative UI freedom.

5.Diff-based updates are structural
Deep semantic refactoring is not supported.

6.No real AI memory
Context is version-based, not conversational.

# What I Would Improve With More Time

~ Component Expansion Strategy

Introduce a versioned component library system for scalable growth.

~ Performance Optimization

Plan caching

Prompt optimization

Parallel agent execution

~ Better Error Recovery

Structured feedback when user intent violates constraints.