"use client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Button } from './ui/button'
import { Bell, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { RentalProperty } from '@prisma/client'
import { useEffect, useState, useTransition } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';

const Notification = () => {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<RentalProperty[]>([])
  const [reload, setReload] = useState<boolean>(false)

  useEffect(() => {
    const getExpairedRental = () => {
      startTransition(async () => {
        try {
          const res = await axios.get(`/api/${params.businessId}/rentals/expired-rental`);
          setData(res.data)
          // toast.success('Get expaired rental successfully.');
        } catch (error: any) {
          const msg = (error as AxiosError).response?.data as string;
          toast.error(msg || 'Something went wrong at notification!');
        }
      })
    }
    getExpairedRental()
  }, [params.businessId,reload])

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          size="icon"
          variant={data.length === 0 ? 'outline' : 'default'}
          className="min-w-10 min-h-10"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-96 h-screen left-auto after:w-auto">
        <div className="h-2 w-[100px] rounded-full bg-muted absolute -left-16 top-1/2 rotate-90" />
        <div className='flex justify-between p-4 gap-3'>
          <DrawerHeader className='flex-1 p-0'>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>Rental property Notifications.</DrawerDescription>
          </DrawerHeader>
          <Button variant="secondary" size="icon" onClick={()=>setReload(!reload)}>
            <RefreshCcw className='w-4 h-4'/>
          </Button>
        </div>
        <div className="px-2 overflow-auto space-y-2">
          {isPending && (
            <div className='w-full h-10 justify-center items-center flex'>
              <Spinner />
            </div>
          )}
          {(!isPending && data.length === 0) && (
            <div className="flex justify-center items-center h-32">Empty Rental Expaired Found</div>
          )}
          {data &&
            data.map((notif) => (
              <Card key={notif.id}>
                <CardHeader className="p-4 justify-between flex-row items-start">
                  <div>
                    <CardTitle>{notif.rentalNumber}</CardTitle>
                    <CardDescription>You have a rental is expaired and not settled</CardDescription>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push(`/${params.businessId}/rentals/${notif.id}/view`)}
                  >
                    View
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                      <h3 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                        Rental period
                      </h3>
                      <p className="text-base font-medium leading-none">
                        {`${format(notif.startDate, "LLL dd, yy")} - ${format(notif.endDate, "LLL dd, yy")}`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                        Unit
                      </h3>
                      <p className="text-base font-medium leading-none">
                        {notif.unit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default Notification
