# Claude Code Guidelines by Jason Suarez

*Project-agnostic guidelines for AI-powered development with context engineering at its core*

## Philosophy: Context-Driven Development

These guidelines embody a **context engineering** approach to AI-assisted development, inspired by tools like [Repo Prompt](https://repoprompt.com) that excel at building focused, relevant context from codebases. The goal is to create robust, powerful workflows that maintain consistency across projects through intelligent context management and systematic change tracking.

## Core Principles

### 1. Context is King
- **Always work with the right context at the right moment**
- Build focused context using AST-aware file selection
- Maintain context awareness across file and folder levels
- Use context to enforce guidelines, naming conventions, and architectural patterns

### 2. Change Tracking & Documentation
- **Track every change with concise, actionable documentation**
- Maintain per-file change logs using AST-inspired change detection
- Document architectural decisions and their evolution
- Create README files at key entry points (especially `src/` folders)

### 3. Systematic Workflows
- **Implement pre- and post-processing hooks for consistency**
- Use repeatable patterns across all projects
- Enforce conventions through automated checks
- Build cumulative knowledge through systematic documentation

## Implementation Framework

### A. Context Engineering Workflows

#### Pre-Request Analysis
```markdown
Before any code changes:
1. **Context Scan**: Identify affected files using dependency analysis
2. **Change Impact**: Check existing change logs to avoid duplication
3. **Pattern Detection**: Identify existing conventions and architectural patterns
4. **Scope Definition**: Define clear boundaries for the changes
```

#### Post-Request Processing
```markdown
After implementation:
1. **Change Documentation**: Update per-file change logs concisely
2. **Pattern Validation**: Ensure consistency with established conventions
3. **Context Update**: Update architectural documentation if needed
4. **Commit Preparation**: Stage changes with descriptive commit messages
```

### B. File-Level Change Tracking

Create and maintain `CHANGES.md` files alongside critical components:

```markdown
# Component Change Log

## [2025-01-21] Authentication Refactor
- **Type**: Architecture change
- **Impact**: High - affects all auth flows
- **Changes**: Migrated from local auth to Clerk integration
- **Files**: `auth/`, `middleware/auth.ts`, `types/auth.ts`
- **Breaking**: Yes - old auth tokens invalid

## [2025-01-20] Database Types Update
- **Type**: Type enhancement
- **Impact**: Low - transparent to consumers
- **Changes**: Added branded types for IDs
- **Files**: `types/database.ts`
- **Breaking**: No
```

### C. Documentation Standards

#### Entry Point READMEs
Every significant directory must have a README.md explaining:
- **Purpose**: What this directory/module does
- **Architecture**: How it fits into the larger system
- **Key Files**: Most important files and their roles
- **Usage Examples**: How to use the main exports
- **Change History**: Link to relevant change logs

#### Architectural Decision Records (ADRs)
Document significant decisions in `docs/decisions/`:
```markdown
# ADR-001: TRPC for Type-Safe API Communication

## Status: Accepted

## Context
Need type-safe communication between frontend and backend with automatic TypeScript inference.

## Decision
Implement TRPC for all API endpoints with shared types via npm packages.

## Consequences
- Positive: Full type safety, automatic inference, excellent DX
- Negative: Learning curve, additional build complexity
```

### D. Type-First Development

#### Branded Types for Domain Modeling
```typescript
// Define domain-specific branded types
export type UserId = Brand<string, 'UserId'>;
export type VideoId = Brand<string, 'VideoId'>;
export type Timestamp = Brand<number, 'Timestamp'>;

// Use consistently across all modules
export interface User {
  id: UserId;
  email: string;
  createdAt: Timestamp;
}
```

#### Shared Type Packages
- Create npm packages for shared types across microservices
- Use TRPC for automatic type inference between frontend/backend
- Maintain type compatibility through semantic versioning

### E. Testing Philosophy

#### Test Organization
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.spec.ts        # Unit tests
│   │   └── Button.integration.ts # Integration tests
│   └── README.md
├── services/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts
│   └── README.md
└── __tests__/
    ├── e2e/                      # End-to-end tests
    └── fixtures/                 # Test data and mocks
```

#### Testing Conventions with Vitest
- **Unit Tests**: Pure logic, isolated components
- **Integration Tests**: API endpoints, database interactions
- **E2E Tests**: User workflows, critical paths
- **Property-Based Testing**: Use for complex algorithms

```typescript
// Example: Property-based testing with Vitest
import { test, expect } from 'vitest';
import fc from 'fast-check';
import { validateEmail } from './validation';

test('email validation properties', () => {
  fc.assert(
    fc.property(
      fc.emailAddress(),
      (email) => validateEmail(email).isValid === true
    )
  );
});
```

## Code Quality Gates

### Pre-Commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": [
        "npm run lint",
        "npm run type-check",
        "npm run test:unit",
        "npm run format",
        "npm run update-change-logs"
      ]
    }
  }
}
```

### Commit Message Standards
Follow Conventional Commits with context-aware prefixes:
```
feat(auth): implement Clerk integration with branded types

- Add UserId branded type for type safety
- Migrate from local auth to Clerk JWT verification
- Update middleware to use new auth patterns

BREAKING CHANGE: Old auth tokens are no longer valid
```

### Code Review Checklist
- [ ] **Context Alignment**: Changes align with existing patterns
- [ ] **Type Safety**: All types properly defined and branded where appropriate
- [ ] **Documentation**: READMEs updated, change logs maintained
- [ ] **Testing**: Appropriate test coverage with Vitest
- [ ] **Performance**: No unnecessary re-renders or heavy computations
- [ ] **Architecture**: Follows established architectural decisions

## AI Development Workflow

### Phase 1: Context Building
1. **Repository Scan**: Identify relevant files using dependency analysis
2. **Pattern Recognition**: Detect existing conventions and architectural patterns
3. **Change History**: Review relevant change logs to avoid duplication
4. **Scope Planning**: Define clear boundaries and expected outcomes

### Phase 2: Implementation
1. **Type-First**: Define types and interfaces before implementation
2. **Test-Driven**: Write failing tests, then implement to make them pass
3. **Pattern Consistency**: Follow established naming and architectural conventions
4. **Documentation**: Update relevant READMEs and change logs

### Phase 3: Validation
1. **Quality Gates**: Run linting, type-checking, and tests
2. **Context Verification**: Ensure changes align with broader system context
3. **Documentation Review**: Verify all documentation is current and accurate
4. **Commit Strategy**: Create atomic, well-documented commits

## Technology Preferences

### Frontend/Backend Communication
- **Primary**: TRPC for type-safe APIs
- **Fallback**: REST with OpenAPI schemas
- **Shared Types**: Via npm packages

### Testing Stack
- **Primary**: Vitest (fast, modern, excellent TypeScript support)
- **Legacy Support**: Jest (migrate to Vitest when possible)
- **Property Testing**: fast-check
- **E2E**: Playwright

### Type System
- **Branded Types**: For domain modeling and type safety
- **Strict TypeScript**: Enable all strict mode flags
- **Runtime Validation**: Zod for API boundaries
- **Code Generation**: When beneficial for DX

### Documentation Tools
- **API Docs**: Generated from TRPC/OpenAPI schemas
- **Component Docs**: Storybook for UI components
- **Architecture**: Mermaid diagrams in markdown
- **Change Tracking**: Structured markdown logs

## Enforcement Strategies

### Automated Checks
- **Lint Rules**: Custom ESLint rules for naming conventions
- **Type Coverage**: Enforce minimum type coverage thresholds
- **Test Coverage**: Maintain coverage above 80% for critical paths
- **Documentation**: Automated checks for README presence

### Development Environment
- **Editor Config**: Shared configuration for consistent formatting
- **VSCode Settings**: Project-specific settings for optimal DX
- **Extensions**: Recommended extensions for TypeScript, testing, etc.

### Continuous Integration
- **Build Pipeline**: Type-check → Lint → Test → Build
- **Quality Gates**: Block merges that don't meet quality standards
- **Documentation**: Auto-generate and deploy documentation
- **Change Detection**: Automatically update change logs where possible

## Guidelines for Claude Code Integration

When using these guidelines with Claude Code or similar AI assistants:

1. **Always request context analysis** before starting work
2. **Provide change log history** for the relevant files
3. **Specify type safety requirements** explicitly
4. **Request documentation updates** as part of the implementation
5. **Ask for test coverage** appropriate to the change type
6. **Validate against existing patterns** before proposing new approaches

These guidelines create a systematic, context-aware approach to AI-assisted development that maintains consistency, quality, and architectural coherence across projects while leveraging the power of modern tooling and type systems.