"use client";

import * as z from 'zod'
import { useForm } from "react-hook-form"
import { VerificationSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/auth/form-error';
import { FormSuccess } from '@/components/auth/form-success';
import { useState, useTransition } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { VerifyEmail } from '@/actions/verify-email';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAUIT_LOGIN_REDIRECT } from '@/routes';
import { TokenType } from '@prisma/client';
import { useVerifyEmailModal } from '@/hooks/use-verfiy-email-modal';
import { Modal } from '@/components/ui/modal';
import { signOut, useSession } from 'next-auth/react';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { resendEmail } from '@/actions/resend-email';
import { toast } from 'sonner';

export const VerifyModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const VerifyEmailModal = useVerifyEmailModal();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof VerificationSchema>>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      OTPVerify: '',
    }
  })

  const callbackUrl = searchParams.get('callbackUrl');

  const onClick = () => {
    startTransition(async () => {
      await signOut({
        callbackUrl: '/sign-in'
      })
    })
  }

  const onSubmit = (values: z.infer<typeof VerificationSchema>) => {
    setError('')
    setSuccess('')
    startTransition(() => {
      VerifyEmail({ ...values, type: TokenType.EMAIL })
        .then((data) => {
          setError(data.error)
          setSuccess(data.success)
          if (data.success) {
            VerifyEmailModal.onClose()
            
            router.replace(callbackUrl || DEFAUIT_LOGIN_REDIRECT)
          } else if (data.status === 403) {
            onClick()
          }
          form.reset()
        })
    })
  }
  const onSubmitResend = () => {
    setError('');
    setSuccess('');
    startTransition(() => {
      resendEmail()
        .then((data) => {
          if (data.status === 200) {
            // Success: Display success message to the user
            setSuccess(data.success);
            toast.success(data.success);
          } else {
            // Error: Display error message to the user
            setError(data.error);
            toast.error(data.error);
          }
        })
        .catch((error) => {
          // Handle any unexpected errors
          console.error('Unexpected error during email resend:', error);
          setError('Something went wrong. Please try again later.');
          toast.error('Something went wrong. Please try again later.');
        });
    });
  };
  

  // Renderer callback with condition
  const renderer = ({ minutes, seconds, completed }: CountdownRenderProps) => {
    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return (
      <Button
        disabled={!completed}
        variant={completed ? "link" : "ghost"}
        size="sm"
        onClick={onSubmitResend}
      >
        {completed ? "Resend verification" : `${formattedMinutes}:${formattedSeconds}`}
      </Button>
    )
  };


  return (
    <Modal
      title="Verify Email"
      description="Please verify your email for continue."
      isOpen={VerifyEmailModal.isOpen}
      onClose={VerifyEmailModal.onClose}
    >
      <Button className='w-full my-3' variant="outline" onClick={onClick}>
        Change Email
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name='OTPVerify'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormDescription>
                    Fill the verification code recived from email.
                  </FormDescription>
                  <FormControl>
                    <InputOTP maxLength={6} disabled={isPending} autoFocus {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                  <FormDescription className='flex gap-1 items-center'>
                    {`Didn't`} receive the verification email?
                    <Countdown
                      date={Date.now() + (1000 * 6)}
                      renderer={renderer}
                    />
                  </FormDescription>
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
          >Continue</Button>
        </form>
      </Form>
    </Modal>
  )
}
