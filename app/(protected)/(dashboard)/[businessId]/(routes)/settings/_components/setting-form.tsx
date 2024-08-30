"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SettingSchema } from "@/schema";
import axios, { AxiosError } from "axios";
import { signOut } from "next-auth/react";
import SwitchWidget from "@/components/ui/switch-widget";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";


interface SettingFormProps {
  data: {
    showAPIDoc: boolean;
  }
}

const SettingForm = ({ data }: SettingFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const origin = useOrigin();

  const baseUrl = `${origin}/api-doc`;

  const form = useForm<z.infer<typeof SettingSchema>>({
    resolver: zodResolver(SettingSchema),
    defaultValues: {
      showAPIDoc: data.showAPIDoc
    }
  });

  const onSubmit = (values: z.infer<typeof SettingSchema>) => {
    startTransition(async () => {
      try {
        await axios.put(`/api/setting`, values);
        router.refresh();
        toast.success('Setting Updated successfully.');
      } catch (error: any) {
        const msg = (error as AxiosError).response?.data as string;
        toast.error(msg || 'Something went wrong!');
      }
    })
  }

  return (
    <div className="space-y-3">
      <ApiAlert title="GET" variant="admin" description={`${baseUrl}`} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full border p-3 rounded">
          <div className="flex flex-col max-sm:space-y-4 gap-4">
            <FormField
              control={form.control}
              name="showAPIDoc"
              render={({ field }) => (
                <SwitchWidget
                  label="Show API Document"
                  description="Enable this option if you want to access in API Document."
                  field={{ value: field.value, onChange: field.onChange }}
                />
              )}
            />
          </div>
          <div className="ml-auto flex gap-3 items-center">
            <Button disabled={isPending} type="submit">
              Save Change
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default SettingForm