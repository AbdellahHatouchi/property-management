"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "./data-table-row-actions";
import { formattedNumberToMAD } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import TooltipIcon from "@/components/tooltip-icon";

export type RentalColumn = {
  id: string;
  rentalNumber: string;
  propertyName: string;
  settled: boolean;
  unit: string;
  tenantCinOrPassport: string;
  tenantName: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const columns: ColumnDef<RentalColumn>[] = [
  {
    accessorKey: "rentalNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rental Num" />
    ),
    cell: ({ row }) => <div className="min-w-[160px]">{row.getValue("rentalNumber")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "tenantCinOrPassport",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CIN / Passport" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("tenantCinOrPassport")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "tenantName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tenant Name" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("tenantName")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "propertyName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property Name" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("propertyName")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("unit")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'settled',
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.settled ? (
          <TooltipIcon
            label="The pyament of rental is settled"
            icon={CheckCircle2}
            className="text-emerald-600"
          />
        ) : (
          <TooltipIcon
            label="The pyament of rental is not settled"
            icon={XCircle}
            className="text-destructive"
          />
        )}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    }
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{formattedNumberToMAD(row.getValue("totalAmount"))}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("startDate")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("endDate")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("createdAt")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
]


