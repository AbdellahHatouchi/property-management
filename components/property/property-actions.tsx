"use client"

import { AlignVerticalJustifyEnd, Copy, IdCard, MapPinHouse, MoreHorizontalIcon, PenBoxIcon, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useParams, useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { toast } from "sonner"
import { Property } from "@prisma/client"
import { useTransition } from "react"
import axios, { AxiosError } from "axios"

interface PropertyActionProps {
  property: Property
}

export function PropertyAction({
  property
}: PropertyActionProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const onDelete = () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/${params.businessId}/properties/${property.id}`);
        router.refresh();
        router.push(`/${params.businessId}/properties`)
        toast.success('Property deleted successfully.');
      } catch (error: any) {
        const msg = (error as AxiosError).response?.data as string;
        toast.error(msg || 'Something went wrong!');
      }
    })
  }
  const onCopy = async (key: keyof Property) => {
    try {
      if (typeof property[key] === 'string') {
        navigator.clipboard.writeText(property[key] as string)
        toast.success('Text copied to clipboard!')
      }
    } catch (e) {
      toast.error('Failed to copy text.')
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
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onCopy('name')}>
                  <IdCard className="mr-2 h-4 w-4" />
                  <span>name</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy('address')}>
                  <MapPinHouse className="mr-2 h-4 w-4" />
                  <span>Address</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy('type')}>
                  <AlignVerticalJustifyEnd className="mr-2 h-4 w-4" />
                  <span>Type</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router.push(`/${params.businessId}/properties/${property.id}`)}>
          <PenBoxIcon className="h-4 w-4 mr-2" />
          Update
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <ConfirmModal
          header="Delete Property?"
          description="This will delete the property and all those assigned to it."
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