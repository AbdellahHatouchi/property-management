"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "./data-table-row-actions";
import TooltipIcon from "@/components/tooltip-icon";
import { CheckCircle2, XCircle } from "lucide-react";
import { formattedNumberToMAD } from "@/lib/utils";

export type PropertyColumn = {
  id: string;
  name: string;
  type: string;
  dailyRentalCost: number;
  monthlyRentalCost: number;
  isAvailable: boolean;
  createdAt: string;
}

export const columns: ColumnDef<PropertyColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property Name" />
    ),
    cell: ({ row }) => <div className="min-w-[160px]">{row.getValue("name")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("type")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'isAvailable',
    header: 'Availablity',
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isAvailable ? (
          <TooltipIcon
            label="Units are currently available"
            icon={CheckCircle2}
            className="text-emerald-600"
          />
        ) : (
          <TooltipIcon
            label="No units available in this time"
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
    accessorKey: "dailyRentalCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Daily Cost" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{formattedNumberToMAD(row.getValue("dailyRentalCost"))}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "monthlyRentalCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monthly Cost" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{formattedNumberToMAD(row.getValue("monthlyRentalCost"))}</div>,
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


