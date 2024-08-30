import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"


const NavbarMobile = ({children}:{
  children: React.ReactNode
}) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="w-4 h-4"/>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>RENT MASTER</SheetTitle>
          <SheetDescription>
            Property management app
          </SheetDescription>
          {children}
        </SheetHeader>
      </SheetContent>
    </Sheet>

  )
}

export default NavbarMobile