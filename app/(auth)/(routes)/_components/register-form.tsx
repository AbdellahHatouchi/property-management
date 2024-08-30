"use client";

import * as z from 'zod'
import { useForm } from "react-hook-form"
import { RegisterSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { FormError } from '../_components/form-error';
import { FormSuccess } from '../_components/form-success';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

export const RegisterForm = () => {
  const [isSeePwd, setIsSeePwd] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    }
  })
  const IconPwd = isSeePwd ? Eye : EyeOff;
  const handleChangeSeePwd = () => {
    setIsSeePwd((prev) => !prev);
  }

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      try {
        const res = await axios.post('/api/auth/register', values)
        const { data } = res;
        console.log(data)
        setError(data?.error)
        setSuccess(data?.success)
      } catch (error) {
        const { error: msg } = (error as AxiosError).response?.data as { error: string }
          || { error: "Something went wrong." }
        toast.error(msg)
        setError(msg)
      }
    })

  }

  return (
    <CardWrapper
      headerTitle="Rent Master"
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/sign-in"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder='jone doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' disabled={isPending} placeholder='jone@gmail.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
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
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type='submit'
            className='w-full'
            disabled={isPending}
          >Create an account</Button>
        </form>
      </Form>
    </CardWrapper>
  )
}