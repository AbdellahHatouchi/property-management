"use client";

import { useEffect } from "react";

import { useVerifyEmailModal } from "@/hooks/use-verfiy-email-modal";

const VerifyEmailPage = () => {
  const onOpen = useVerifyEmailModal((state) => state.onOpen);
  const isOpen = useVerifyEmailModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null;
};
 
export default VerifyEmailPage;
