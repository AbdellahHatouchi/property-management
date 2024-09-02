"use client";

import { useEffect, useState } from "react";

import { BusinessModal } from "@/components/modals/business-modal";
import { VerifyModal } from "@/components/modals/verify-email-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <BusinessModal />
      <VerifyModal />
    </>
  );
}
