"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tenant } from "@prisma/client"
import { Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { TenantView } from "@/components/tenant/tenant-view"

interface TenantInfoProps {
  tenant: Tenant
}



const TenantInfo = ({
  tenant,
}: TenantInfoProps) => {
  const router = useRouter()
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex max-md:px-3 items-center justify-between">
            <Heading
              title="Tenant Information"
              description="Discover the tenant details of the registered individual"
            />
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              <Undo2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Back</span>
            </Button>
          </div>
          <Separator />
          <Separator />
          <div className="grid md:grid-cols-3 gap-3">
            <TenantView tenant={tenant} withActions={true} className="md:col-span-2" />
          </div>
          <Separator />
        </div>
        <div className="space-y-3">
          {/* todo */}

        </div>
      </div>
    </>
  )
}

export default TenantInfo