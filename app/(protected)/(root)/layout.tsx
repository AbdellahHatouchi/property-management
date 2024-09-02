import { getUserById } from '@/data/user';
import { db } from '@/lib/db';
import { UserAuth } from '@/lib/get-current-user';
import { signOut } from 'next-auth/react';
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

  const userData = await getUserById(user.id);

  if (!userData) {
    signOut({
      callbackUrl: '/sign-in'
    })
    return;
  };

  if (!userData.emailVerified){
    redirect('/verify-email')
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
