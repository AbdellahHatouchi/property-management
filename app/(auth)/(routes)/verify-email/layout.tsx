import { UserAuth } from '@/lib/get-current-user';
import { DEFAUIT_LOGIN_REDIRECT } from '@/routes';
import { redirect } from 'next/navigation';


export default async function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await UserAuth()

  if (!user || !user.id) {
    redirect('/sign-in');
  }

  if (user.emailVerified) {
    redirect(DEFAUIT_LOGIN_REDIRECT);
  };

  return (
    <>
      {children}
    </>
  );
};
