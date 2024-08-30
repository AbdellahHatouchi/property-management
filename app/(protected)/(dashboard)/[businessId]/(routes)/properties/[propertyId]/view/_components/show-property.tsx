"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Property, Unit } from "@prisma/client"
import { Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { PropertyView } from "@/components/property/property-view"

interface PropertyInfoProps {
  property: Property & {units : Unit[]}
}



const PropertyInfo = ({
  property,
}: PropertyInfoProps) => {
  const router = useRouter()
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex max-md:px-3 items-center justify-between">
            <Heading
              title="Property Information"
              description="Discover the property details of the registered individual"
            />
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              <Undo2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Back</span>
            </Button>
          </div>
          <Separator />
          <Separator />
          <div className="grid md:grid-cols-3 gap-3">
            <PropertyView property={property} withActions={true} className="md:col-span-2" />
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

export default PropertyInfo