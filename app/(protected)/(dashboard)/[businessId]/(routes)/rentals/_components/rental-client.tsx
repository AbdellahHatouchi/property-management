"use client";

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator";
import { Activity, CheckCircle2, CreditCard, Plus, UserIcon, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { columns, RentalColumn } from "./columns";
import { facetedFilter } from "@/constants";
import { CardReportList, CardReportProps } from "@/components/crad-report";

interface RentalsClientProps {
  data: RentalColumn[];
  totalCashIn: number
  totalCashOut: number
  balance: number
}

const RentalsClient = ({
  data,
  totalCashIn,
  totalCashOut,
  balance,
}: RentalsClientProps) => {
  const params = useParams();
  const router = useRouter();

  const facetedFilter: facetedFilter = {
    label: 'Status',
    accessorKey: 'settled',
    options: [
      { value: 'true', label: 'Settled', icon: CheckCircle2 },
      { value: 'false', label: 'Not settled', icon: XCircle }
    ]
  }

  const searchKeys = [
    { accessorKey: 'rentalNumber', label: 'Rental Num' },
    { accessorKey: 'propertyName', label: 'Property Name' },
    { accessorKey: 'unit', label: 'Unit' },
    { accessorKey: 'tenantCinOrPassport', label: 'Tenant Identify' },
    { accessorKey: 'tenantName', label: 'Tenant Name' },
  ]
  const list = [
    {
      label: 'Settled Rental Cost',
      total: totalCashIn,
    },
    {
      label: 'Pending Rental Cost',
      total: totalCashOut,
      icon: CreditCard
    },
    {
      label: 'Balance',
      total: balance,
      icon: Activity
    },
  ] as CardReportProps[]

  return (
    <>
      <div className="flex max-md:flex-col gap-3 max-md:px-3 md:items-center justify-between">
        <Heading title={`Rentals (${data.length})`} description="Manage rentals property for your business" />
        <Button onClick={() => router.push(`/${params.businessId}/rentals/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <CardReportList dataList={list} />
      <Separator />
      <DataTable
        toolbar={{
          facetedFilter,
          searchKeys
        }}
        defaultColVisibility={{
          tenantCinOrPassport: false,
          totalAmount: false,
          createdAt: false,
        }}
        columns={columns}
        data={data}
      />
    </>
  )
}

export default RentalsClient