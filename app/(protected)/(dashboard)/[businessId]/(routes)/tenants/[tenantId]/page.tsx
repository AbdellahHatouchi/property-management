import { db } from "@/lib/db";
import { TenantForm } from "./_components/tenant-form";

const TenantPage = async ({
  params
}: {
  params: { tenantId: string }
}) => {
  const tenant = await db.tenant.findUnique({
    where: {
      id: params.tenantId
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-3 md:p-8 pt-6">
        <TenantForm initialData={tenant} />
      </div>
    </div>
  );
}

export default TenantPage;
