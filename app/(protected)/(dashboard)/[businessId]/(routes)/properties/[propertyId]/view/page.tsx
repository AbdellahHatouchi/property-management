import { db } from "@/lib/db"
import PropertyInfo from "./_components/show-property"
import { redirect } from "next/navigation"

const PropertyViewPage = async ({ params }: {
  params: {
    propertyId: string,
    businessId: string,
  }
}) => {
  const property = await db.property.findUnique({
    where: {
      id: params.propertyId,
      businessId: params.businessId
    },
    include: {
      units: true
    }
  })

  // check if the there is an id and no property is assocaited with it 
  if (!property) {
    return redirect('/not-found')
  }
  return (
    <PropertyInfo
      property={property}
    />
  )
}

export default PropertyViewPage