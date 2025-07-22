'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight, Briefcase, Users, Palette, FileText, DollarSign, Headphones } from 'lucide-react'
import { useRouter } from 'next/navigation'

const agents = [
  {
    id: 'project-manager',
    title: 'Project Manager',
    icon: Briefcase,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    arrowColor: 'text-blue-500',
    route: '/projects'
  },
  {
    id: 'resource-manager', 
    title: 'Resource Manager',
    icon: Users,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200', 
    iconColor: 'text-orange-600',
    arrowColor: 'text-orange-500',
    route: '/staffers'
  },
  {
    id: 'brand-designer',
    title: 'Brand Designer', 
    icon: Palette,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600', 
    arrowColor: 'text-purple-500'
  },
  {
    id: 'quoting-expert',
    title: 'Quoting Expert',
    icon: FileText, 
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    iconColor: 'text-pink-600',
    arrowColor: 'text-pink-500',
    route: '/quotes'
  },
  {
    id: 'finance-manager',
    title: 'Finance Manager',
    icon: DollarSign,
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    arrowColor: 'text-green-500'
  },
  {
    id: 'support-specialist',
    title: 'Support Specialist', 
    icon: Headphones,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    arrowColor: 'text-yellow-500'
  }
]

interface AgentCardsProps {
  onAgentClick?: (agentId: string) => void
}

export function AgentCards({ onAgentClick }: AgentCardsProps) {
  const router = useRouter()

  const handleAgentClick = (agent: typeof agents[0]) => {
    if (agent.route) {
      router.push(agent.route)
    } else {
      onAgentClick?.(agent.id)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {agents.map((agent) => {
        const IconComponent = agent.icon
        return (
          <Card 
            key={agent.id}
            className={`${agent.bgColor} ${agent.borderColor} border-2 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
            onClick={() => handleAgentClick(agent)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white ${agent.iconColor}`}>
                  <IconComponent size={20} />
                </div>
                <span className="font-medium text-slate-900">{agent.title}</span>
              </div>
              <ArrowRight size={20} className={agent.arrowColor} />
            </div>
          </Card>
        )
      })}
    </div>
  )
} 