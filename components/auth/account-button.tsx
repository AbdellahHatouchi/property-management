"use client";
import { useParams, useRouter } from "next/navigation";


interface AcountButtonProps {
    children?: React.ReactNode
  }
  
  export const AcountButton = ({
    children
  }:AcountButtonProps) => {
    const router = useRouter();
    const params = useParams();
    const onClick = ()=>{
        router.push(`/${params.businessId}/profile`)
    }
    return (
      <div onClick={onClick} className="cursor-pointer">
        {children}
      </div>
    )
  }