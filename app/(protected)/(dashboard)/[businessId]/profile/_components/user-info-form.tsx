"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UpdateUserInfoSchema } from "@/schema";
import axios from "axios";
import { signOut } from "next-auth/react";

export interface UserFormProps {
  initialData: User | null;
}

const UserInfoForm = ({ initialData }: UserFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateUserInfoSchema>>({
    resolver: zodResolver(UpdateUserInfoSchema),
    defaultValues: (initialData && {
      ...initialData,
      name: initialData.name || '',
      phoneNumber: initialData.phoneNumber || ''
    }) || {
      name: '',
      email: '',
      phoneNumber: ''
    }
  });

  const onSubmit = (values: z.infer<typeof UpdateUserInfoSchema>) => {
    startTransition(async () => {
      try {
        const response = await axios.put(`/api/update-user-info`, values);
        const data = response.data
        console.log(response.data);

        if (response.status === 200) {
          toast.success(data.success || `User Updated Successfully`);
          if (data.isEmailUpdate) {
            router.replace('/verify-email')
          }
          router.refresh();
        } else {
          if (data.error === "Unauthorized") {
            signOut();
          }
          toast.error(data.error || `Failed to update user`);
        }
      } catch (error) {
        console.error('An error occurred while updating the user:', error);
        toast.error('Failed to update user');
      }
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full bg-slate-300 dark:bg-slate-800 p-3 rounded">
          <div className="flex flex-col max-sm:space-y-4 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="name" {...field} />
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
                    <Input disabled={isPending} placeholder="email" {...field} />
                  </FormControl>
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
                    <Input disabled={isPending} placeholder="06*****" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="ml-auto flex gap-3 items-center">
            <Button disabled={isPending} type="submit">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default UserInfoForm