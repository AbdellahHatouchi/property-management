"use client"

import { Copy, CreditCard, Mail, MessageSquare, MoreHorizontalIcon, PenBoxIcon, Trash2 } from "lucide-react"

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
import { Tenant } from "@prisma/client"
import { useTransition } from "react"
import axios, { AxiosError } from "axios"

interface TenantActionProps {
  tenant: Tenant
}

export function TenantAction({
  tenant
}: TenantActionProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const onDelete = () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/${params.businessId}/tenants/${tenant.id}`);
        router.refresh();
        router.push(`/${params.businessId}/tenants`)
        toast.success('Tenant deleted successfully.');
      } catch (error: any) {
        const msg = (error as AxiosError).response?.data as string;
        toast.error(msg || 'Something went wrong!');
      }
    })
  }
  const onCopy = async (key: keyof Tenant) => {
    try {
      if (typeof tenant[key] === 'string') {
        navigator.clipboard.writeText(tenant[key] as string)
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
                <DropdownMenuItem onClick={() => onCopy('cinOrPassport')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>CIN / Passport</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy('email')}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy('phoneNumber')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Phone number</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router.push(`/${params.businessId}/tenants/${tenant.id}`)}>
          <PenBoxIcon className="h-4 w-4 mr-2" />
          Update
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <ConfirmModal
          header="Delete Tenant?"
          description="This will delete the tenant and all those assigned to it."
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