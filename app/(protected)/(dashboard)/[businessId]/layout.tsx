import { redirect } from 'next/navigation';

import Navbar from '@/components/navbar'
import { UserAuth } from '@/lib/get-current-user';
import { db } from '@/lib/db';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { businessId: string }
}) {
  const user = await UserAuth();

  if (!user || !user.id) {
    redirect('/sign-in');
  }

  const business = await db.business.findFirst({
    where: {
      id: params.businessId,
      userId: user.id,
    }
  });

  if (!business) {
    redirect('/');
  };

  return (
    <>
      <Navbar />
      <div className="flex-col mt-2 w-full 2xl:mx-auto 2xl:max-w-screen-xl 2xl:rounded-md border">
        <div className="flex-1 space-y-4 md:p-8 pt-6">
          {children}
        </div>
      </div>
    </>
  );
};
