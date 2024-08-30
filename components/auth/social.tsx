"use client";

import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { DEFAUIT_LOGIN_REDIRECT } from "@/routes";


export const Social = () => {

  const onClick = () => {
    signIn('google',{
      callbackUrl: DEFAUIT_LOGIN_REDIRECT
    })
  }
  return (
    <div className="flex items-center w-full gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={onClick}
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        Google
      </Button>
    </div>
  )
}
