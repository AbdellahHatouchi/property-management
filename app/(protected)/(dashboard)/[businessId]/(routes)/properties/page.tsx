import { db } from "@/lib/db";
import { PropertyColumn } from "./_components/columns";
import { format } from "date-fns";
import PropertiesClient from "./_components/properties-client";

const PropertiesPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

  const properties = await db.property.findMany({
    where: {
      businessId: params.businessId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedData = properties
    .map((property) => ({
      id: property.id,
      name: property.name,
      type: property.type,
      dailyRentalCost: property.dailyRentalCost,
      monthlyRentalCost: property.monthlyRentalCost,
      isAvailable: property.isAvailable,
      createdAt: format(new Date(property.createdAt), 'MMMM do, yyyy')
    })) as PropertyColumn[]
  return (
    <>
      <PropertiesClient data={formattedData} />
    </>
  )
}

export default PropertiesPage