"use client";

import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

interface LogoutButtonProps {
  children?: React.ReactNode
}

export const LogoutButton = ({
  children
}: LogoutButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const onClick = () => {
    if (isPending) return;
    startTransition(async () => {
      await signOut({
        callbackUrl: '/sign-in'
      });
    })
  }
  return (
    <span onClick={onClick} className={cn(
      "cursor-pointer w-full",
      isPending && "opacity-50 cursor-wait"
    )}>
      {children}
    </span>
  )
}
