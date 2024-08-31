import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { UserButton } from "./auth/user-button";
import { NavbarNavigation } from "./navbar-navigation";
import Notification from "./notification";

const Navbar = async () => {
  const user = await UserAuth();

  if (!user || !user.id) {
    redirect('/sign-in');
  }

  const business = await db.business.findMany({
    where: {
      userId: user.id,
    }
  });

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <NavbarNavigation business={business}/>
        <div className="ml-auto flex items-center space-x-4">
          <Notification />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
