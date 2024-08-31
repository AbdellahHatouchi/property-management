"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.businessId}`,
      label: 'Overview',
      active: pathname === `/${params.businessId}`,
    },
    {
      href: `/${params.businessId}/tenants`,
      label: 'Tenants',
      active: pathname === `/${params.businessId}/tenants`,
    },
    {
      href: `/${params.businessId}/properties`,
      label: 'Properties',
      active: pathname === `/${params.businessId}/properties`,
    },
    {
      href: `/${params.businessId}/rentals`,
      label: 'Rental Property',
      active: pathname === `/${params.businessId}/rentals`,
    },
    {
      href: `/${params.businessId}/settings`,
      label: 'Settings',
      active: pathname === `/${params.businessId}/settings`,
    },
  ]

  return (
    <nav
      className={cn("flex max-md:flex-col items-start md:items-center md:space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary max-md:p-4',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
        >
          {route.label}
      </Link>
      ))}
    </nav>
  )
};
