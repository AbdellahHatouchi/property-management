import { db } from '@/lib/db';
import { UserAuth } from '@/lib/get-current-user';
import { redirect } from 'next/navigation';


export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await UserAuth()

  if (!user || !user.id) {
    redirect('/sign-in');
  }

  const business = await db.business.findFirst({
    where:{
      userId: user.id
    }
  })

  if (business) {
    redirect(`/${business.id}`);
  };

  return (
    <>
      {children}
    </>
  );
};
