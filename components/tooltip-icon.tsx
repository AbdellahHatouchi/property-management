import { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface TooltipIconProps {
  icon: LucideIcon
  className: string
  label: string
}
const TooltipIcon: React.FC<TooltipIconProps> = ({ icon: Icon, className, label }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button">
          <Icon className={cn('w-6 h-6', className)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TooltipIcon
