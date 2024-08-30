"use client";

import { useEffect } from "react";

import { useBusinessModal } from "@/hooks/use-business-modal";

const SetupPage = () => {
  const onOpen = useBusinessModal((state) => state.onOpen);
  const isOpen = useBusinessModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null;
};
 
export default SetupPage;
