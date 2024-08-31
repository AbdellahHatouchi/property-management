"use client"

import { Eye, MoreHorizontalIcon, Trash2 } from "lucide-react"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useParams, useRouter } from "next/navigation"
import { RentalColumn } from "./columns"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { useState } from "react"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"

interface DataTableRowActionsProps {
  row: Row<RentalColumn>
}

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, setIsPending] = useState(false)
  const onDelete = async() => {
      try {
        setIsPending(true)
        await axios.delete(`/api/${params.businessId}/rentals/${row.original.id}`);
        router.refresh();
        toast.success('Rental deleted successfully.');
      } catch (error: any) {
        const msg = (error as AxiosError).response?.data as string;
        toast.error(msg || 'Something went wrong!');
      }finally{
        setIsPending(false);
      }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => router.push(`/${params.businessId}/rentals/${row.original.id}/view`)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <ConfirmModal
          header="Delete Rental?"
          description="This will delete the rental and all those assigned to them."
          disabled={isPending}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-2 cursor-pointer text-sm w-full justify-start font-normal"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}