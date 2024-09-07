import { db } from "@/lib/db";
import { PropertyColumn } from "./_components/columns";
import { format } from "date-fns";
import PropertiesClient from "./_components/properties-client";

const PropertiesPage = async ({ params }: {
  params: {
    businessId: string,
  }
}) => {

  return (
    <>
      <PropertiesClient />
    </>
  )
}

export default PropertiesPage