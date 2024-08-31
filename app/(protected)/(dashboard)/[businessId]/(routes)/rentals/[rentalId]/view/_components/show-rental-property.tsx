"use client";
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Property, RentalProperty, Tenant, Unit } from "@prisma/client"
import { BadgeDollarSign, FileDown, Trash, Undo2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation";
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import DocumentPDF from "@/components/pdf/document-pdf";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface showRentalPropertyProps {
  data: RentalProperty & {
    tenant: Tenant,
    property: Property & { units: Unit[] },
    business: {
      name: string
    }
  }
}

export const ShowRentalProperty = ({ data }: showRentalPropertyProps) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [openToPaid, setOpenToPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.businessId}/rentals/${params.rentalId}`);
      router.push(`/${params.businessId}/rentals`);
      router.refresh();
      toast.success('Rental deleted successfully.');
    } catch (error: any) {
      const msg = (error as AxiosError).response?.data as string;
      toast.error(msg || 'Something went wrong!');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }
  const onPaid = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/${params.businessId}/rentals/${params.rentalId}`);
      router.refresh();
      toast.success('Rental Paid successfully.');
    } catch (error: any) {
      const msg = (error as AxiosError).response?.data as string;
      toast.error(msg || 'Something went wrong!');
    } finally {
      setLoading(false);
      setOpenToPaid(false);
    }
  }
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        key={'delete'}
      />
      <AlertModal
        key={'paid'}
        isOpen={openToPaid}
        onClose={() => setOpenToPaid(false)}
        onConfirm={onPaid}
        loading={loading}
        btnVariant="primary"
      />
      <div className="flex max-md:flex-col gap-2 max-md:px-3 md:items-center justify-between">
        <Heading
          title={`${data.rentalNumber}`}
          description="View rental details including all informations about the rented."
        />
        <div className="flex max-md:grid max-md:grid-cols-2 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/${params.businessId}/rentals`)}>
            <Undo2 className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PDFDownloadLink
            document={<DocumentPDF rentalData={data} />}
            fileName={`${data.rentalNumber}.pdf`}
          >
            {({ loading }) => (
              <Button size="sm" className="max-md:w-full" disabled={loading}>
                <FileDown className="h-4 w-4 mr-2" />
                {loading ? 'Loading document...' : `Download`}
              </Button>
            )}
          </PDFDownloadLink>
          {!data.settled && (<Button disabled={loading} variant="primary" size="sm" onClick={() => setOpenToPaid(true)}>
            <BadgeDollarSign className="h-4 w-4 mr-2" />
            Paid
          </Button>)}
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="rentalInfo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rentalInfo">Rental Informations</TabsTrigger>
          <TabsTrigger value="rentalPdf">Rental PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="rentalInfo" className="space-y-2">
          <div className="flex flex-col-reverse lg:grid lg:col-span-4 gap-2 lg:grid-cols-2">
            <div className="flex flex-col justify-stretch gap-2">
              {/* Rental Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Rental Information</CardTitle>
                  <CardDescription>Details about the rental</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Rental Number</span>
                      <p className="font-mono font-medium">{`${data.rentalNumber}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Created Date</span>
                      <p className="font-mono font-medium">
                        {format(data.createdAt, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Property Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>Details about the property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Property Name</span>
                      <p className="font-mono font-medium">{`${data.property.name}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Unit</span>
                      <p className="font-mono font-medium">{`${data.unit}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Start Date</span>
                      <p className="font-mono font-medium">
                        {format(data.startDate, 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">End Date</span>
                      <p className="font-mono font-medium">
                        {format(data.endDate, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
            <div className="flex flex-col justify-stretch gap-2">
              {/* Tenant Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Information</CardTitle>
                  <CardDescription>Details about the tenant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Tenant Name</span>
                      <p className="font-mono font-medium">{`${data.tenant.name}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Tenant Email</span>
                      <p className="font-mono font-medium">{`${data.tenant.email}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Phone Number</span>
                      <p className="font-mono font-medium">{`${data.tenant.phoneNumber}`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Address</span>
                      <p className="font-mono font-medium">{`${data.tenant.address}`}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Rental Cost and Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Rental Cost & Payment</CardTitle>
                  <CardDescription>Details about the rental cost and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Total Amount</span>
                      <p className="font-mono font-medium">{`${data.totalAmount} MAD`}</p>
                    </div>
                    <div className="bg-secondary col-span-2 p-3 rounded-md">
                      <span className="text-muted-foreground">Rental Cost</span>
                      <p className="font-mono font-medium">{`${data.rentalCost} MAD`}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* payment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Pyament Details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary p-3 rounded-md">
                  <span className="text-muted-foreground">Payment Status</span>
                  <p className={`font-mono font-medium ${data.settled ? 'text-green-600' : 'text-red-600'}`}>
                    {data.settled ? 'Settled' : 'Not Settled'}
                  </p>
                </div>
                <div className="bg-secondary p-3 rounded-md">
                  <span className="text-muted-foreground">Payment Date</span>
                  <p className="font-mono font-medium">
                    {data.datePaid ? format(data.datePaid, 'dd/MM/yyyy') : '----'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
        <TabsContent value="rentalPdf">
          <PDFViewer className="rounded-lg border" width="100%" height="800px" showToolbar={true}>
            <DocumentPDF rentalData={data} />
          </PDFViewer>
        </TabsContent>
      </Tabs>
    </>
  )
}