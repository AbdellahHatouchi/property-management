"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UpdatePasswordSchema } from "@/schema"

export interface UserFormProps {
  userId: string ,
}

const UserPasswordForm = ({ userId}: UserFormProps) => {
  const [isSeePwd, setIsSeePwd] = useState<boolean>(false);
  const [isSeePwd2, setIsSeePwd2] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const IconPwd = isSeePwd ? Eye : EyeOff;
  const IconPwd2 = isSeePwd2 ? Eye : EyeOff;
  const handleChangeSeePwd = () => {
    setIsSeePwd((prev) => !prev);
  }
  const handleChangeSeePwd2 = () => {
    setIsSeePwd2((prev) => !prev);
  }
  const form = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      password: '',
      confirmation: ''
    }
  });

  const onSubmit = (values: z.infer<typeof UpdatePasswordSchema>) => {
    startTransition(() => {
      toast.info('this function not completed')
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full bg-slate-300 dark:bg-slate-800 p-3 rounded">
          <div className="flex flex-col max-sm:space-y-4 gap-4">
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='w-full relative'>
                      <IconPwd onClick={handleChangeSeePwd} className='absolute right-2 w-5 h-5 z-40 cursor-pointer top-1/2 -translate-y-1/2' />
                      <Input type={isSeePwd ? 'text' : 'password'} disabled={isPending} placeholder='********' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Password</FormLabel>
                  <FormControl>
                    <div className='w-full relative'>
                      <IconPwd2 onClick={handleChangeSeePwd2} className='absolute right-2 w-5 h-5 z-40 cursor-pointer top-1/2 -translate-y-1/2' />
                      <Input type={isSeePwd2 ? 'text' : 'password'} disabled={isPending} placeholder='********' {...field} />
                    </div>
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

export default UserPasswordForm