import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { formattedNumberToMAD } from "@/lib/utils"

export interface CardReportProps {
  label: string
  icon?: LucideIcon
  total: number
  description?: string
}

export interface CardReportListProps {
  dataList: CardReportProps[]
}

export const CardReport = ({
  label,
  icon: Icon,
  total,
  description
}: CardReportProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {label}
        </CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : (<svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedNumberToMAD(total)}</div>
        {description && (<p className="text-xs text-muted-foreground">
          {description}
        </p>)}
      </CardContent>
    </Card>
  )
}

export const CardReportList = ({ dataList }: CardReportListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
      {dataList.map((card, idx) => (
        <CardReport
          key={card.label + idx}
          label={card.label}
          total={card.total}
          description={card.description}
          icon={card.icon}
        />
      ))}
    </div>
  )
}
