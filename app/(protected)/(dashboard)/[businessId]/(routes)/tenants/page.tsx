import TenantsClient from "./_components/tenants-client";

const TenantsPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

  return (
    <>
      <TenantsClient />
    </>
  )
}

export default TenantsPage