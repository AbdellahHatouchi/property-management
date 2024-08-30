import { db } from "@/lib/db"
import TenantInfo from "./_components/show-tenant"
import { redirect } from "next/navigation"

const TenantViewPage = async ({ params }: {
  params: {
    tenantId: string
  }
}) => {
  const tenant = await db.tenant.findUnique({
    where: {
      id: params.tenantId,
    }
  })

  // check if the there is an id and no person is assocaited with it 
  if (!tenant) {
    return redirect('/not-found')
  }
  return (
    <TenantInfo
      tenant={tenant}
    />
  )
}

export default TenantViewPage