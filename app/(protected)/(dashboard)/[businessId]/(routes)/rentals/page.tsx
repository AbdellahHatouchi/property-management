import { db } from "@/lib/db";
import RentalsClient from "./_components/rental-client";

const RentalsPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

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
        totalCashIn={totalCashIn._sum.totalAmount || 0}
        totalCashOut={totalCashOut._sum.totalAmount || 0}
        costAverage={averageRentalCost._avg.rentalCost || 0}
      />
    </>
  )
}

export default RentalsPage