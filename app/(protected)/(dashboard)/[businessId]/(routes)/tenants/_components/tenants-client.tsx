"use client";

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator";
import { facetedFilter } from "@/constants";
import { Plus, User, UserCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { columns, TenantColumn } from "./columns";

interface TenantsClientProps {
  data: TenantColumn[];
}

const TenantsClient = ({ data }: TenantsClientProps) => {
  const params = useParams();
  const router = useRouter();

  const facetedFilter: facetedFilter = {
    label: 'Tourist',
    accessorKey: 'isTourist',
    options: [
      { value: 'true', label: 'Tourist', icon: UserCheck },
      { value: 'false', label: 'Citizen', icon: User }
    ]
  }
  const searchKeys = [
    { accessorKey: 'name', label: 'Full Name' },
    { accessorKey: 'cinOrPassport', label: 'CIN / Passport' },
    { accessorKey: 'phoneNumber', label: 'Phone number' }
  ]

  return (
    <>
      <div className="flex max-md:flex-col gap-3 max-md:px-3 md:items-center justify-between">
        <Heading title={`Tenants (${data.length})`} description="Manage tenants for your business" />
        <Button onClick={() => router.push(`/${params.businessId}/tenants/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        toolbar={{
          facetedFilter,
          searchKeys
        }}
        columns={columns}
        data={data}
      />
    </>
  )
}

export default TenantsClient