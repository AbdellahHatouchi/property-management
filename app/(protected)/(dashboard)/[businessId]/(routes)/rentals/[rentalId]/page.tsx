import { db } from "@/lib/db";
import { RentalForm } from "./_components/rental-form";
import { getRentalNumber } from "@/lib/get-rental-number";

const RentalPage = async ({
  params
}: {
  params: { rentalId: string, businessId: string }
}) => {
  const rentalNumber = await getRentalNumber(params.businessId)
  const properties = await db.property.findMany({
    where: {
      isAvailable: true,
      businessId: params.businessId,
    },
    include: {
      units: {
        where: {
          isAvailable: true,
        }
      }
    }
  });
  const tenants = await db.tenant.findMany({
    where: {
      businessId: params.businessId
    }
  });


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-3 md:p-8 pt-6">
        <RentalForm
          tenants={tenants}
          rentalNumber={rentalNumber}
          properties={properties}
        />
      </div>
    </div>
  );
}

export default RentalPage;
