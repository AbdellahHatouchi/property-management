import { db } from "@/lib/db";
import { TenantColumn } from "./_components/columns";
import { format } from "date-fns";
import TenantsClient from "./_components/tenants-client";

const TenantsPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

  const tenants = await db.tenant.findMany({
    where: {
      businessId: params.businessId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedData = tenants
    .map((tenants) => ({
      id: tenants.id,
      name: tenants.name,
      email: tenants.email,
      cinOrPassport: tenants.cinOrPassport,
      phoneNumber: tenants.phoneNumber,
      isTourist: tenants.isTourist,
      createdAt: format(new Date(tenants.createdAt), 'MMMM do, yyyy')
    })) as TenantColumn[]
  return (
    <>
      <TenantsClient data={formattedData} />
    </>
  )
}

export default TenantsPage