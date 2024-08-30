"use client";

import { Business } from "@prisma/client";
import NavbarMobile from "@/components/navbar-mobile";
import BusinessSwitcher from "@/components/business-switcher";
import { MainNav } from "@/components/main-nav";
import { useMediaQuery } from 'usehooks-ts'
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export const NavbarNavigation = ({ business }: {
  business: Business[]
}) => {
  const [mounted, setMounted] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setMounted(false);
  }, []);

  if (mounted) {
    return <Spinner />
  };
  
  return (
    <>
      {isMobile ? (<NavbarMobile>
        <div className="flex flex-col gap-4">
          <BusinessSwitcher items={business} />
          <MainNav className="mx-6" />
        </div>
      </NavbarMobile>) :
        (
          <>
            <BusinessSwitcher items={business} />
            <MainNav className="mx-6" />
          </>
        )
      }
    </>
  )
}
