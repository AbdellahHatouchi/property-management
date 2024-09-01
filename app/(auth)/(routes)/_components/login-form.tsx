"use client";

import * as z from 'zod'
import { useForm } from "react-hook-form"
import { LoginSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { FormError } from '../_components/form-error';
import { FormSuccess } from '../_components/form-success';
import { BackButton } from '@/components/auth/back-button';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl');
  const [isSeePwd, setIsSeePwd] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })
  const IconPwd = isSeePwd ? Eye : EyeOff;
  const handleChangeSeePwd = () => {
    setIsSeePwd((prev) => !prev);
  }
  
  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      try {
        const res = await axios.post('/api/auth/login', values)
        const { data } = res;
        setError(data?.error)
        setSuccess(data?.success)
        if (data?.success){
          if (callbackUrl){
            router.push(callbackUrl)
          }else {
            router.refresh()
          }
        }
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
      headerLabel="Welcome Back"
      backButtonLabel="Don't have an account ?"
      backButtonHref="/sign-up"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className="space-y-4">
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
          >Login</Button>
        </form>
        <BackButton
          label="Forgot Password ?"
          href="/reset-password"
        />
      </Form>
    </CardWrapper>
  )
}