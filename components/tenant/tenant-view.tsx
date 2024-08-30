import { Tenant } from "@prisma/client"
import { format } from "date-fns"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantAction } from "./tenant-actions"


export const TenantView = ({
  tenant,
  withActions,
  className
}: {
  tenant: Tenant,
  className?: string
  withActions: boolean,
}) => {
  return (
    <>
      <Card className={className}>
        <CardHeader className="flex w-full flex-row items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarFallback>
              {tenant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <CardTitle className="capitalize">{tenant.name}</CardTitle>
              <CardDescription>{tenant.email}</CardDescription>
            </div>
            {withActions && <TenantAction tenant={tenant} />}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{!tenant.isTourist ? "CIN" : "Passport"}</p>
            <p className="text-gray-700 dark:text-gray-300">{tenant.cinOrPassport}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Phone Number</p>
            <p className="text-gray-700 dark:text-gray-300">{tenant.phoneNumber}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Date of birth</p>
            <p className="text-gray-700 dark:text-gray-300">{format(tenant.dateOfBirth, 'MMMM do yyyy')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tourist Status</p>
            <p className="text-gray-700 dark:text-gray-300">
              {tenant.isTourist ? "Tourist" : "Resident"}
            </p>
          </div>
          <div className="bg-gray-100 md:col-span-2 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Address</p>
            <p className="text-gray-700 dark:text-gray-300">{tenant.address}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-2">
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Created Date</p>
            <p className="text-gray-700 dark:text-gray-300">{format(tenant.createdAt, 'MMMM do yyyy')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 border rounded-md">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Updeted Date</p>
            <p className="text-gray-700 dark:text-gray-300">{format(tenant.updatedAt, 'MMMM do yyyy')}</p>
          </div>
        </CardHeader>
      </Card>
    </>
  )
}
