import { db } from "@/lib/db";
import { RentalColumn } from "./_components/columns";
import { format } from "date-fns";
import RentalsClient from "./_components/rental-client";

const RentalsPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

  const rentals = await db.rentalProperty.findMany({
    where: {
      businessId: params.businessId
    },
    include: {
      property: {
        select: {
          name: true
        }
      },
      tenant: {
        select: {
          name: true,
          cinOrPassport: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });


  const formattedData = rentals
    .map((rental) => ({
      id: rental.id,
      rentalNumber: rental.rentalNumber,
      unit: rental.unit,
      tenantName: rental.tenant.name,
      settled: rental.settled,
      tenantCinOrPassport: rental.tenant.cinOrPassport,
      propertyName: rental.property.name,
      totalAmount: rental.totalAmount,
      startDate: format(new Date(rental.startDate), 'MMMM do, yyyy'),
      endDate: format(new Date(rental.endDate), 'MMMM do, yyyy'),
      createdAt: format(new Date(rental.createdAt), 'MMMM do, yyyy')
    })) as RentalColumn[]

  // Total Cash In
  const totalCashIn = await db.rentalProperty.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      settled: true,
      businessId: params.businessId
    },
  });

  // Total Cash Out
  const totalCashOut = await db.rentalProperty.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      settled: false,
      businessId: params.businessId
    },
  });
  // average cost
  const averageRentalCost = await db.rentalProperty.aggregate({
    _avg: {
      rentalCost: true,
    },
    where: {
      businessId: params.businessId
    },
  });

  return (
    <>
      <RentalsClient
        data={formattedData}
        totalCashIn={totalCashIn._sum.totalAmount || 0}
        totalCashOut={totalCashOut._sum.totalAmount || 0}
        costAverage={averageRentalCost._avg.rentalCost || 0}
      />
    </>
  )
}

export default RentalsPage