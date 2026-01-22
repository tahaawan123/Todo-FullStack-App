# Frontend UI Builder Skill

## Purpose
This skill implements or refines Frontend UI in a Spec-Driven Full-Stack project following best practices for Next.js, TypeScript, and Tailwind CSS applications.

## Scope
### In Scope
- UI components (buttons, forms, cards, modals, etc.)
- Pages & layouts (app router structure)
- Client/server component boundaries
- UX states (loading, empty, error, success)
- Visual polish & responsiveness
- Accessibility features
- Component composition and reusability

### Out of Scope
- Backend code implementation
- Authentication logic (except UI aspects)
- Database schema design
- Server-side business logic
- Infrastructure setup
- DevOps configurations

## Tech Stack
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (integration with existing auth)
- React Server Components (default)
- React Client Components (when needed)

## Implementation Rules
1. **Spec Compliance**: Always read relevant specs before writing code
2. **Server Components**: Use by default for data fetching and static content
3. **Client Components**: Use only when interactivity is required (useState, useEffect, event handlers)
4. **Component Design**: Keep components small, reusable, and clean
5. **Styling**: Use Tailwind CSS only (no inline styles or other CSS frameworks)
6. **No External Libraries**: Do not use MUI, Shadcn, Chakra, etc. - only Tailwind
7. **Accessibility**: Include proper labels, focus states, and semantic HTML
8. **Responsive Design**: Ensure mobile-first responsive behavior

## UI Quality Standards
### Must Have
- Clean, minimal design aesthetic
- Professional appearance suitable for SaaS products
- Visually balanced layout and spacing
- Mobile-responsive across all screen sizes
- Accessible markup with proper ARIA attributes
- Consistent typography and color scheme
- Loading states and skeleton screens
- Empty states with helpful messaging
- Error states with clear user guidance

### Avoid
- Over-design or heavy visual effects
- Excessive animations or transitions
- Cluttered layouts with too many elements
- Inconsistent spacing or typography
- Hard-to-read text or poor contrast

## API Integration
- All API calls must go through `/lib/api.ts` wrapper
- JWT token handling is assumed to be automatic via auth headers
- Do NOT embed raw fetch logic directly in components
- Follow existing patterns in the codebase for API interactions

## Required Specs to Reference
Always consult these specifications when implementing:
- `@specs/features/task-crud.md` - Task management UI requirements
- `@specs/features/authentication.md` - Auth UI components and flows
- `@specs/ui/components.md` - Component library standards
- `@specs/ui/pages.md` - Page structure and navigation

## Task-Specific UI Patterns
When building task-related interfaces:
- Display task title, description, and status clearly
- Provide intuitive action buttons (edit, delete, complete, archive)
- Show loading indicators during API operations
- Implement skeleton screens for perceived performance
- Show friendly empty states when no tasks exist
- Handle API errors gracefully with user-friendly messages

## Error Handling
- Gracefully handle network errors
- Show user-friendly error messages
- Provide retry mechanisms where appropriate
- Log errors appropriately for debugging
- Maintain UI stability during error states

## File Structure Convention
```
app/
├── components/
│   ├── ui/           # Reusable UI primitives
│   └── features/     # Feature-specific components
├── lib/
│   └── api.ts        # API client wrapper
└── types/            # Shared TypeScript types
```

## Component Best Practices
- Use descriptive names for components
- Follow Next.js App Router conventions
- Implement proper TypeScript typing
- Use compound components pattern when appropriate
- Leverage React hooks effectively
- Minimize prop drilling with Context API when needed

## Performance Considerations
- Optimize component rendering with React.memo when appropriate
- Use dynamic imports for large components
- Implement proper image optimization
- Lazy load non-critical components
- Minimize bundle size

## Testing Considerations
- Write component tests for interactive elements
- Test responsive behavior
- Verify accessibility features
- Test error states and loading conditions
- Validate form submissions and validations

## When to Stop and Ask
If the specification does not clearly define UI behavior, stop and ask for clarification. Do NOT assume or invent UI patterns that aren't specified.