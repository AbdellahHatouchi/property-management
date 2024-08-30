"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Plus, Trash, Undo2 } from "lucide-react"
import { Property, PropertyType, Unit } from "@prisma/client"
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
import { propertySchema } from "@/schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SwitchWidget from "@/components/ui/switch-widget"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PropertyFormValues = z.infer<typeof propertySchema>

interface PropertyFormProps {
  initialData: (Property & { units: Unit[] }) | null;
};

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit property' : 'Create property';
  const description = initialData ? 'Edit a property.' : 'Add a new property';
  const toastMessage = initialData ? 'Property updated.' : 'Property created.';
  const action = initialData ? 'Save changes' : 'Create';
console.log(initialData);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      name: '',
      type: PropertyType.HOUSE,
      dailyRentalCost: 0,
      monthlyRentalCost: 0,
      address: '',
      units: [{
        isAvailable: true,
        number: '',
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'units',
    control: form.control
  })

  const unitMsgError = form.getFieldState('units').error?.root?.message

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.businessId}/properties/${params.propertyId}`, data);
      } else {
        await axios.post(`/api/${params.businessId}/properties`, data);
      }
      router.push(`/${params.businessId}/properties`);
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
      await axios.delete(`/api/${params.businessId}/properties/${params.propertyId}`);
      router.push(`/${params.businessId}/properties`);
      router.refresh();
      toast.success('Property deleted successfully.');
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
          <Button variant="secondary" size="sm" onClick={() => router.push(`/${params.businessId}/properties`)}>
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
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(PropertyType).map((type) => (
                        <SelectItem value={type} className="capitalize" key={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyRentalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rental Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        disabled={loading}
                        type="number"
                        min={1}
                        step={0.1}
                        placeholder="1000 MAD"
                        {...field}
                      />
                      <Badge className="absolute top-1/2 right-2 -translate-y-1/2">MAD</Badge>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyRentalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rental Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        disabled={loading}
                        type="number"
                        min={1}
                        step={0.1}
                        placeholder="1000 MAD"
                        {...field}
                      />
                      <Badge className="absolute top-1/2 right-2 -translate-y-1/2">MAD</Badge>
                    </div>
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
          <Card>
            <div className="flex md:flex-row p-3 md:p-6 gap-2 flex-col justify-between items-center">
              <CardHeader className="p-0">
                <CardTitle>Property Units</CardTitle>
                <CardDescription>Mange your unit of the property</CardDescription>
              </CardHeader>
              <Button
                type="button"
                className="max-md:w-full"
                onClick={() => (append({
                  isAvailable: true,
                  number: ''
                }))}
                disabled={form.watch('type') === PropertyType.HOUSE && fields.length > 0}
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Unit
              </Button>
            </div>
            <CardContent className="max-md:p-3 space-y-2">
              {unitMsgError && (
                (<Alert variant="destructive">
                  <AlertDescription>{unitMsgError}</AlertDescription>
                </Alert>)
              )}
              <div className="md:grid md:grid-cols-3 gap-8">
                {fields.length > 0 ? fields.map((field, i) => (
                  <div key={field.id} className="flex flex-col gap-3 border rounded-md px-4 py-5 relative">
                    <Button
                      type="button"
                      size="icon"
                      className="absolute top-2 right-3"
                      variant="ghost"
                      onClick={() => remove(i)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`units.${i}.number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Number</FormLabel>
                          <FormControl>
                            <Input disabled={loading} placeholder="HR56778" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`units.${i}.isAvailable`}
                      render={({ field }) => (
                        <SwitchWidget
                          label="Is Available"
                          field={{ value: field.value, onChange: field.onChange }}
                        />
                      )}
                    />
                  </div>
                )) : (
                  <div className="flex col-span-3 p-5 items-center justify-center flex-col gap-3 bg-secondary rounded w-full h-60">
                    <span className="text-2xl md:text-3xl font-bold">No Unit Found</span>
                    <span>Try create a new unit</span>
                    <Button
                      type="button"
                      className="max-md:w-full"
                      onClick={() => (append({
                        isAvailable: true,
                        number: ''
                      }))}
                      disabled={form.watch('type') === PropertyType.HOUSE && fields.length > 0}
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Add Unit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form >
    </>
  );
};
