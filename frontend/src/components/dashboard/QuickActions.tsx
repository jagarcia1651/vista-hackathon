'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickActionsProps {
  onActionClick: (prompt: string) => void
}

const quickActions = [
  {
    title: "Project Planning",
    description: "Get help with project structure and timelines",
    prompt: "Help me create a project plan for a new e-commerce website development project. The client wants a custom platform with user authentication, product catalog, shopping cart, and payment integration. Timeline: 3 months, Budget: $150,000, Team size: 5 developers"
  },
  {
    title: "Resource Allocation", 
    description: "Optimize team assignments and capacity",
    prompt: "I need to allocate resources for 3 concurrent projects: Project A (mobile app, 2 months, needs iOS/Android devs), Project B (web platform, 4 months, needs full-stack devs), Project C (data migration, 1 month, needs backend specialists). My team has 2 iOS devs, 3 Android devs, 4 full-stack devs, and 2 backend specialists. How should I allocate them?"
  },
  {
    title: "Generate Quote",
    description: "Create competitive pricing proposals", 
    prompt: "Generate a quote for a consulting project: Digital transformation for a mid-size manufacturing company (500 employees). Scope includes: system integration, process automation, staff training, and 6-month support. They need expertise in ERP systems, workflow automation, and change management."
  },
  {
    title: "Capacity Analysis",
    description: "Analyze team utilization and bottlenecks",
    prompt: "Analyze our team capacity for Q2 2024. Current projects will consume 70% of development capacity, 85% of design capacity, and 60% of QA capacity. We're considering 3 new opportunities worth $500k total. Should we take them on, and what would be the resource implications?"
  }
]

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Try these common PSA scenarios with our AI agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 text-left justify-start"
              onClick={() => onActionClick(action.prompt)}
            >
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-slate-500 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 