import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOutIcon, Settings, User2 } from "lucide-react"
import { LogoutButton } from "./logout-button";
import { AcountButton } from "./account-button";
import { auth } from "@/auth";

export const UserButton = async () => {
  const session = await auth();
  const user = session?.user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="border">
            {user?.name ?
              <span className="font-semibold">{user?.name?.charAt(0).toUpperCase()}</span> :
              <User2 className="dark:text-white text-slate-900" />
            }
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuItem>
          <AcountButton>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-start">
                <p className="text-sm font-medium">{user?.name}</p>
                <span className="text-muted-foreground font-normal text-sm">{user?.email}</span>
              </div>
            </div>
          </AcountButton>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <AcountButton>
            <div className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              <span>Mange my account</span>
            </div>
          </AcountButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
            <LogOutIcon className="w-4 h-4 mr-2" />
            <LogoutButton>Log out</LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
