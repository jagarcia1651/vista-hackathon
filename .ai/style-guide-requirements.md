# Centralized Style Guide Requirements

## Overview
Centralized design system to ensure consistent UI/UX across all vertical slices without requiring custom styling from developers.

## Design System Goals

### 1. Zero Custom Styling
- Developers use only utility classes
- No custom CSS required per slice
- All design decisions pre-made in style guide
- Complete design language for PSA domain

### 2. PSA-Specific Components
- Pre-built components for common PSA patterns
- Professional service industry aesthetics
- Business-focused color schemes and typography
- Dashboard and data visualization components

### 3. Consistency Across Slices
- Uniform component behavior
- Consistent spacing and layout
- Standardized color usage
- Unified typography hierarchy

## Technology Stack

### Base Framework
- **Tailwind CSS** - Utility-first framework
- **shadcn/ui** - Component library foundation
- **Lucide React** - Icon system
- **Recharts** - Data visualization

### Custom Layer
- PSA-specific color palette
- Business-appropriate typography
- Custom component variants
- Domain-specific patterns

## Component Library Structure

### Core Components
```
/lib/design-system/
├── components/
│   ├── ui/                    # Base UI components (buttons, inputs, etc.)
│   ├── layout/                # Layout components (sidebar, header, etc.)
│   ├── data-display/          # Tables, charts, metrics cards
│   ├── forms/                 # Form components with validation
│   ├── feedback/              # Alerts, toasts, loading states
│   └── navigation/            # Breadcrumbs, tabs, pagination
├── styles/
│   ├── globals.css            # Global styles and Tailwind config
│   ├── components.css         # Component-specific styles
│   └── themes.css             # Color themes and variants
├── utils/
│   ├── cn.ts                  # Class name utility
│   ├── colors.ts              # Color system utilities
│   └── formatting.ts          # Data formatting utilities
└── types/
    └── design-system.ts       # Design system TypeScript types
```

### PSA-Specific Components (Based on ProjectAI Design)

#### Dashboard Components
- **MetricsCard** - Large number display with icon and description (like "12 Active Projects")
- **CapacityCard** - Percentage-based capacity display with color coding
- **ProjectStatusCard** - Project health with status badges and progress indicators
- **UtilizationBar** - Horizontal progress bars with skill tags (AWS, Security, IAM)
- **AgentActivityFeed** - Real-time agent thinking logs sidebar

#### Layout Components  
- **Sidebar** - Dark sidebar with navigation icons and labels
- **HeaderBar** - Clean header with breadcrumbs and project selector
- **TabNavigation** - Clean tab interface ("Project Details", "Currently Viewing")
- **ContentArea** - Main content with proper spacing and grid layout

#### Data Display
- **StaffUtilizationRow** - Individual team member with utilization percentage and availability
- **SkillTagBar** - Colored skill tags under utilization bars
- **StatusBadge** - Rounded status indicators (Active Project, in-progress, completed, queued)
- **ResourcePlanningTasks** - Right sidebar task list with agent attribution

#### Forms & Inputs
- **ProjectForm** - Standardized project creation/editing
- **ResourceSelector** - Team member selection with skills
- **BudgetInput** - Financial input with validation
- **DateRangePicker** - Project timeline selection
- **SkillsTagInput** - Multi-select skills input

#### Feedback & Status
- **AgentThinkingLogs** - Live agent activity display
- **ProjectHealthIndicator** - Visual project status
- **ResourceConflictAlert** - Resource allocation warnings
- **QuoteStatusBadge** - Quote/proposal status display

## Color Palette (Based on ProjectAI Reference)

### Primary Colors (Professional Blue System)
```css
--primary-50: #eff6ff      /* Very light blue background */
--primary-100: #dbeafe     /* Light blue for cards/sections */
--primary-500: #3b82f6     /* Main blue for primary actions */
--primary-600: #2563eb     /* Darker blue for hover states */
--primary-900: #1e3a8a     /* Dark blue for text/borders */
```

### Background & Surface Colors
```css
--background: #f8fafc      /* Main app background (light gray) */
--surface: #ffffff         /* Card/panel backgrounds */
--surface-secondary: #f1f5f9  /* Secondary surface areas */
--border: #e2e8f0          /* Subtle borders and dividers */
```

### Status & Metric Colors (From Screenshot)
```css
--status-success: #10b981    /* Green for positive metrics/completed */
--status-warning: #f59e0b    /* Orange for warnings/at-risk */
--status-danger: #ef4444     /* Red for critical/over-budget */
--status-info: #3b82f6       /* Blue for informational */
--status-neutral: #64748b    /* Gray for neutral states */
```

### Utilization Bar Colors
```css
--utilization-high: #ef4444   /* Red - over 90% utilization */
--utilization-medium: #f59e0b /* Orange - 70-90% utilization */
--utilization-good: #10b981   /* Green - 50-70% utilization */
--utilization-low: #64748b    /* Gray - under 50% utilization */
```

### Agent Activity Colors
```css
--agent-thinking: #8b5cf6    /* Purple - agent processing */
--agent-complete: #10b981    /* Green - agent completed */
--agent-error: #ef4444       /* Red - agent error */
--agent-waiting: #6b7280     /* Gray - agent idle */
```

## Typography Scale

### Headings
- **h1**: 2.25rem (36px) - Page titles
- **h2**: 1.875rem (30px) - Section headers
- **h3**: 1.5rem (24px) - Subsection headers
- **h4**: 1.25rem (20px) - Card titles

### Body Text
- **Large**: 1.125rem (18px) - Important content
- **Base**: 1rem (16px) - Standard content
- **Small**: 0.875rem (14px) - Secondary content
- **XS**: 0.75rem (12px) - Captions, timestamps

## Spacing System

### Layout Spacing
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

### Component Spacing
- **Card padding**: lg (24px)
- **Form element spacing**: md (16px)
- **Button padding**: sm horizontal, xs vertical
- **Section margins**: xl (32px)

## Utility Classes

### PSA-Specific Utilities
```css
.psa-card { /* Standard card styling */ }
.psa-metric { /* KPI metric styling */ }
.psa-status-good { /* Positive status indicator */ }
.psa-status-warning { /* Warning status indicator */ }
.psa-status-critical { /* Critical status indicator */ }
.psa-agent-log { /* Agent thinking log styling */ }
.psa-currency { /* Currency formatting */ }
.psa-percentage { /* Percentage display */ }
```

### Layout Utilities
```css
.psa-dashboard-grid { /* Standard dashboard layout */ }
.psa-sidebar-layout { /* Sidebar navigation layout */ }
.psa-form-layout { /* Standard form layout */ }
.psa-table-layout { /* Data table layout */ }
```

## Component Usage Guidelines

### Developers Should Use
- Pre-built PSA components
- Utility classes only
- Design system color tokens
- Standardized spacing values

### Developers Should NOT
- Write custom CSS
- Create new components (use existing)
- Use arbitrary color values
- Define custom spacing

### Example Usage
```tsx
// ✅ Correct - Using design system
<MetricsCard
  title="Monthly Revenue"
  value={formatCurrency(125000)}
  trend={{ value: 12, direction: 'up' }}
  className="psa-metric"
/>

// ❌ Incorrect - Custom styling
<div className="bg-blue-500 p-4 rounded-lg">
  <h3 style={{ color: '#333' }}>Monthly Revenue</h3>
  {/* Custom styled content */}
</div>
```

## Implementation Plan

### Phase 1: Core Components
1. Setup Tailwind + shadcn/ui base
2. Define PSA color palette and typography
3. Create core UI components (buttons, inputs, cards)
4. Build layout components (sidebar, header)

### Phase 2: PSA Components
1. Dashboard and metrics components
2. Data display components (tables, charts)
3. Form components with PSA patterns
4. Agent thinking logs component

### Phase 3: Utilities & Polish
1. PSA-specific utility classes
2. Animation and transition system
3. Responsive design patterns
4. Accessibility compliance

### Phase 4: Documentation
1. Component storybook
2. Usage guidelines and examples
3. Design tokens documentation
4. Developer onboarding guide

## Quality Assurance

### Design Consistency
- Regular design reviews across slices
- Automated visual regression testing
- Component usage monitoring
- Style guide compliance checks

### Developer Experience
- Clear component documentation
- TypeScript support for all components
- Intellisense for utility classes
- Error messages for incorrect usage 