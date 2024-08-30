"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "./data-table-row-actions";
import { CheckCircle2, XCircle } from "lucide-react";
import TooltipIcon from "@/components/tooltip-icon";

export type TenantColumn = {
  id: string;
  name: string;
  cinOrPassport: string;
  email: string;
  phoneNumber: string;
  isTourist: boolean;
  createdAt: string;
}

export const columns: ColumnDef<TenantColumn>[] = [
  {
    accessorKey: "cinOrPassport",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CIN / Passport" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("cinOrPassport")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
    cell: ({ row }) => <div className="min-w-[160px]">{row.getValue("name")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("email")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone number" />
    ),
    cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("phoneNumber")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'isTourist',
    header: 'Tourist',
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isTourist ? (
          <TooltipIcon
            label="This Person is a Tourist"
            icon={CheckCircle2}
            className="text-emerald-600"
          />
        ) : (
          <TooltipIcon
            label="This Person is a Citizen"
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


