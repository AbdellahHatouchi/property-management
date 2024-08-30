import { Property, Unit } from "@prisma/client"
import { format } from "date-fns"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyAction } from "./property-actions"
import { formattedNumberToMAD } from "@/lib/utils"


export const PropertyView = ({
  property,
  withActions,
  className
}: {
  property: Property & { units: Unit[] },
  className?: string
  withActions: boolean,
}) => {
  return (
    <>
      <Card className={className}>
        <CardHeader className="flex w-full flex-row items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarFallback>
              {property.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <CardTitle className="capitalize">{property.name}</CardTitle>
              <CardDescription>{property.businessId}</CardDescription>
            </div>
            {withActions && <PropertyAction property={property} />}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Type</p>
            <p className="text-gray-700 dark:text-gray-300">{property.type}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Daily Rental Cost</p>
            <p className="text-gray-700 dark:text-gray-300">{formattedNumberToMAD(property.dailyRentalCost)}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Rental Cost</p>
            <p className="text-gray-700 dark:text-gray-300">{formattedNumberToMAD(property.monthlyRentalCost)}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Property Status</p>
            <p className="text-gray-700 dark:text-gray-300">
              {property.isAvailable ? "Available" : "Not Available"}
            </p>
          </div>
          <div className="bg-gray-100 md:col-span-2 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Address</p>
            <p className="text-gray-700 dark:text-gray-300">{property.address}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-2">
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Created Date</p>
            <p className="text-gray-700 dark:text-gray-300">{format(property.createdAt, 'MMMM do yyyy')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Updeted Date</p>
            <p className="text-gray-700 dark:text-gray-300">{format(property.updatedAt, 'MMMM do yyyy')}</p>
          </div>
        </CardHeader>
      </Card>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Property Units</CardTitle>
          <CardDescription>Discover the units details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="md:grid md:grid-cols-3 max-md:space-y-2 gap-8">
            {property.units.map((unit) => (
              <div key={unit.id} className="flex flex-col gap-3 border rounded-md px-4 py-5">
                <div className="bg-gray-100 md:col-span-2 dark:bg-gray-900 px-3 py-2 border rounded-md">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unit number</p>
                  <p className="text-gray-700 dark:text-gray-300">{unit.number}</p>
                </div>
                <div className="bg-gray-100 md:col-span-2 dark:bg-gray-900 px-3 py-2 border rounded-md">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unit Status</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {unit.isAvailable ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
