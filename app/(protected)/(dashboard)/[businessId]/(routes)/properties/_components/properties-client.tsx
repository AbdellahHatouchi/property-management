"use client";

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Plus, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { columns, PropertyColumn } from "./columns";
import { facetedFilter } from "@/constants";

interface PropertiesClientProps {
  data: PropertyColumn[];
}

const PropertiesClient = () => {
  const params = useParams();
  const router = useRouter();

  const facetedFilter: facetedFilter = {
    label: 'Availability',
    accessorKey: 'isAvailable',
    options: [
      { value: 'true', label: 'Available', icon: CheckCircle2 },
      { value: 'false', label: 'Not Available', icon: XCircle }
    ]
  }

  const searchKeys = [
    { accessorKey: 'name', label: 'Property Name' },
    { accessorKey: 'type', label: 'Type' },
  ]

  return (
    <>
      <div className="flex max-md:flex-col gap-3 max-md:px-3 md:items-center justify-between">
        <Heading title={`Properties`} description="Manage properties for your business" />
        <Button onClick={() => router.push(`/${params.businessId}/properties/new`)}>
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
        APIPath={`/api/${params.businessId}/properties`}
      />
    </>
  )
}

export default PropertiesClient