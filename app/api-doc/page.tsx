import { getApiDocs } from '@/lib/sawgger';

import ReactSwagger from './react-swagger';
import { UserAuth } from '@/lib/get-current-user';
import { signOut } from 'next-auth/react';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function IndexPage() {
  const user = await UserAuth();
  if (!user) {
    await signOut({
      callbackUrl: '/sign-in'
    })
    return;
  }
  const userData = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      showAPIDocs: true
    }
  })
  if (!userData?.showAPIDocs){
    return redirect('/not-found')
  }
  const spec = await getApiDocs();
  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}