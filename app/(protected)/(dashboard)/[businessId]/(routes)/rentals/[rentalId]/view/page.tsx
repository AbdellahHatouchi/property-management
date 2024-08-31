import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ShowRentalProperty } from "./_components/show-rental-property"

const RentalViewPage = async ({ params }: {
  params: {
    rentalId: string,
    businessId: string,
  }
}) => {
  const rentalProperty = await db.rentalProperty.findUnique({
    where: {
      id: params.rentalId,
      businessId: params.businessId
    },
    include: {
      tenant: true,
      property: {
        include:{
          units: true,
        }
      },
      business: {
        select:{
          name:true
        }
      }
    }
  })

  // check if the there is an id and no rentalProperty is assocaited with it 
  if (!rentalProperty) {
    return redirect('/not-found')
  }
  return (
    <ShowRentalProperty
      data={rentalProperty}
    />
  )
}

export default RentalViewPage