"use client";

import { Spinner } from "@/components/ui/spinner";


const Loading = () => {
  return ( 
    <div className="flex pt-20 h-full w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
   );
}
 
export default Loading;