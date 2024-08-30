"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { CalendarIcon, Trash, Undo2 } from "lucide-react"
import { Tenant } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import SwitchWidget from "@/components/ui/switch-widget"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { tenantSchema } from "@/schema"


type TenantFormValues = z.infer<typeof tenantSchema>

interface TenantFormProps {
  initialData: Tenant | null;
};

export const TenantForm: React.FC<TenantFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit tenant' : 'Create tenant';
  const description = initialData ? 'Edit a tenant.' : 'Add a new tenant';
  const toastMessage = initialData ? 'Tenant updated.' : 'Tenant created.';
  const action = initialData ? 'Save changes' : 'Create';

  // Get the current date
  const currentDate = new Date()

  // Calculate the year 18 years ago
  const yearBefore = currentDate.getFullYear() - 18

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      dateOfBirth: new Date(
        yearBefore,
        currentDate.getMonth(),
        currentDate.getDate()
      ),
      cinOrPassport: '',
      isTourist: false,
      phoneNumber: '',
      address: '',
    }
  })

  const onSubmit = async (data: TenantFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.businessId}/tenants/${params.tenantId}`, data);
      } else {
        await axios.post(`/api/${params.businessId}/tenants`, data);
      }
      router.push(`/${params.businessId}/tenants`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      const msg = (error as AxiosError).response?.data as string;
      toast.error(msg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.businessId}/tenants/${params.tenantId}`);
      router.push(`/${params.businessId}/tenants`);
      router.refresh();
      toast.success('Tenant deleted successfully.');
    } catch (error: any) {
      const msg = (error as AxiosError).response?.data as string;
      toast.error(msg || 'Something went wrong!');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/${params.businessId}/tenants`)}>
            <Undo2 className="h-4 w-4 mr-2" />
            Back
          </Button>
          {initialData && (
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="isTourist"
            render={({ field }) => (
              <SwitchWidget
                label="Is Tourist"
                description="Enable this option if the client is a tourist visiting the country.
                  A tourist is someone who is not a resident and is temporarily staying in the country for leisure or travel purposes."
                field={{ value: field.value, onChange: field.onChange }}
              />
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="cinOrPassport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{form.watch('isTourist') ? 'Passport' : 'CIN'}</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="XX72827" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={loading} placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:grid md:grid-cols-4 gap-8">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="my-[5px]">Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        captionLayout="dropdown-buttons"
                        fromYear={new Date('1900-01-01').getFullYear()}
                        toYear={new Date().getFullYear() - 14}
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                        classNames={{
                          caption_label: 'hidden',
                          vhidden: 'hidden',
                          caption_dropdowns: 'flex gap-2 items-center',
                          dropdown:
                            'flex h-7 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1'
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="+212 ******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
