"use client"

import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { CalendarIcon, Check, CheckCircle2, ChevronsUpDown, Info, Trash, Undo2 } from "lucide-react"
import { Property, Tenant, Unit } from "@prisma/client"
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
import { RentalPropertySchema } from "@/schema"
import TooltipIcon from "@/components/tooltip-icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { calculateAmount, cn, formattedNumberToMAD } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type RentalFormValues = z.infer<typeof RentalPropertySchema>

type PropertyWithUnits = Property & { units: Unit[] }

interface RentalFormProps {
  properties: PropertyWithUnits[]
  tenants: Tenant[]
  rentalNumber: string
};

export const RentalForm: React.FC<RentalFormProps> = ({
  properties,
  tenants,
  rentalNumber,
}) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<PropertyWithUnits | null>(null);
  const [openComboboxProperty, setOpenComboboxProperty] = useState(false)
  const [openComboboxTenants, setOpenComboboxTenants] = useState(false)
  const [openComboboxUnits, setOpenComboboxUnits] = useState(false)


  const title = 'Create rental';
  const description = 'Add a new rental';
  const toastMessage = 'Rental created.';
  const action = 'Create';

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(RentalPropertySchema),
    defaultValues: {
      propertyId: '',
      rentalNumber: rentalNumber,
      rentalType: 'Daily',
      tenantId: '',
      unit: ''
    }
  })


  const onSubmit = async (data: RentalFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.businessId}/rentals`, data);
      router.push(`/${params.businessId}/rentals`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      const msg = (error as AxiosError).response?.data as string;
      toast.error(msg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/${params.businessId}/rentals`)}>
            <Undo2 className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-2 max-md:space-y-4 gap-8">
            <FormField
              control={form.control}
              name="rentalNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex my-[7px] justify-between items-center">
                    Rental Number
                    <TooltipIcon
                      icon={Info}
                      label="Rental Number is auto-generated"
                      className="text-indigo-500 w-4 h-4"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      className="disabled:opacity-95"
                      placeholder="RNTL0827"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Popover
                    open={openComboboxTenants}
                    onOpenChange={setOpenComboboxTenants}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxTenants}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? tenants.find((p) => p.id === field.value)
                              ?.name
                            : 'Select Tenant'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="lg:w-80 p-0">
                      <Command
                        filter={(value, search) => {
                          const extendValue = tenants.find(t => t.id === value)?.name.toLocaleLowerCase() ?? '';
                          if (extendValue.includes(search)) return 1
                          return 0
                        }}
                      >
                        <CommandInput placeholder="Search tenant by name..." />
                        <CommandList>
                          <CommandEmpty className="flex pt-4 flex-col justify-center items-center gap-2">
                            <span>No Tenant found.</span>
                          </CommandEmpty>
                          <ScrollArea className="h-44">
                            <ScrollBar orientation="vertical" />
                            <CommandGroup>
                              {tenants
                                .map((t) => (
                                  <CommandItem
                                    value={t.id}
                                    key={t.id}
                                    onSelect={() => {
                                      form.setValue('tenantId', t.id)
                                      setOpenComboboxTenants(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        t.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm">{t.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {t.cinOrPassport}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="rentalType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="md:grid md:grid-cols-2 max-md:space-y-3 gap-5">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Daily" className="hidden" />
                        </FormControl>
                        <FormLabel className={cn(
                          "cursor-pointer relative font-normal p-3 w-full border rounded-md flex flex-col gap-5",
                          form.watch('rentalType') === 'Daily' ? "border-blue-600" : "border-muted-foreground"
                        )}>
                          <div className="space-y-1">
                            <h5 className="font-semibold tracking-wide">Daily Rental</h5>
                            <p className="text-xs text-muted-foreground">
                              select if you want rental property one or more days
                            </p>
                          </div>
                          <span className="">{currentProperty?.dailyRentalCost ? formattedNumberToMAD(currentProperty.dailyRentalCost) : '--MAD'}</span>
                          <CheckCircle2 className={cn(
                            "absolute top-4 right-4 w-5 h-5",
                            form.watch('rentalType') === 'Daily' ? "text-blue-600" : "text-muted-foreground"
                          )} />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Monthly" className="hidden" />
                        </FormControl>
                        <FormLabel className={cn(
                          "cursor-pointer relative font-normal p-3 w-full border rounded-md flex flex-col gap-5",
                          form.watch('rentalType') === 'Monthly' ? "border-blue-600" : "border-muted-foreground"
                        )}>
                          <div className="space-y-1">
                            <h5 className="font-semibold tracking-wide">Monthly Rental</h5>
                            <p className="text-xs text-muted-foreground">
                              select if you want rental property one or more month
                            </p>
                          </div>
                          <span className="">{currentProperty?.monthlyRentalCost ? formattedNumberToMAD(currentProperty.monthlyRentalCost) : '--MAD'}</span>
                          <CheckCircle2 className={cn(
                            "absolute top-4 right-4 w-5 h-5",
                            form.watch('rentalType') === 'Monthly' ? "text-blue-600" : "text-muted-foreground"
                          )} />
                        </FormLabel>
                      </FormItem>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 max-md:space-y-4 gap-8">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Popover
                    open={openComboboxProperty}
                    onOpenChange={setOpenComboboxProperty}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxProperty}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? properties.find((p) => p.id === field.value)
                              ?.name
                            : 'Select Property'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="lg:w-80 p-0">
                      <Command
                        filter={(value, search) => {
                          const extendValue = properties.find(prop => prop.id === value)?.name ?? '';
                          if (extendValue.includes(search)) return 1
                          return 0
                        }}
                      >
                        <CommandInput placeholder="Search property by name..." />
                        <CommandList>
                          <CommandEmpty className="flex pt-4 flex-col justify-center items-center gap-2">
                            <span>No Property found.</span>
                          </CommandEmpty>
                          <ScrollArea className="h-44">
                            <ScrollBar orientation="vertical" />
                            <CommandGroup>
                              {properties
                                .map((p) => (
                                  <CommandItem
                                    value={p.id}
                                    key={p.id}
                                    onSelect={() => {
                                      form.setValue('propertyId', p.id)
                                      setCurrentProperty(p)
                                      setOpenComboboxProperty(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        p.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm">{p.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {p.type}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Popover
                    open={openComboboxUnits}
                    onOpenChange={setOpenComboboxUnits}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxUnits}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? currentProperty?.units.find((p) => p.number === field.value)
                              ?.number
                            : 'Select Unit'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="lg:w-80 p-0">
                      <Command
                        filter={(value, search) => {
                          const extendValue = currentProperty?.units.find(u => u.number === value)?.number.toLocaleLowerCase() ?? '';
                          if (extendValue.includes(search)) return 1
                          return 0
                        }}
                      >
                        <CommandInput placeholder="Search unit by number..." />
                        <CommandList>
                          <CommandEmpty className="flex pt-4 flex-col justify-center items-center gap-2">
                            <span>No Unit Available Found.</span>
                          </CommandEmpty>
                          <ScrollArea className="h-44">
                            <ScrollBar orientation="vertical" />
                            <CommandGroup>
                              {currentProperty?.units
                                .map((u) => (
                                  <CommandItem
                                    value={u.number}
                                    key={u.number}
                                    onSelect={() => {
                                      form.setValue('unit', u.number)
                                      setOpenComboboxUnits(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        u.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm">{u.number}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentalDateRange"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Rental Date Range</FormLabel>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-3 p-4 rounded border justify-between items-center">
            <p className="">Total Amount: </p>
            <p className="text-xl font-bold">{
              formattedNumberToMAD(
                calculateAmount({
                  dailyRentalCost: currentProperty?.dailyRentalCost || 0,
                  monthlyRentalCost: currentProperty?.monthlyRentalCost || 0,
                  rentalType: form.watch('rentalType'),
                  dateRange: form.watch('rentalDateRange'),
                }) ?? 0)}
            </p>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form >
    </>
  );
};
