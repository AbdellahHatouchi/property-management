import { db } from "@/lib/db";
import { PropertyForm } from "./_components/property-form";

const PropertyPage = async ({
  params
}: {
  params: { propertyId: string, businessId: string }
}) => {
  const property = await db.property.findUnique({
    where: {
      id: params.propertyId,
      businessId: params.businessId
    },
    include: {
      units: true
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-3 md:p-8 pt-6">
        <PropertyForm initialData={property} />
      </div>
    </div>
  );
}

export default PropertyPage;
