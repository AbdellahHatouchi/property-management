import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator';
import UserInfoForm from './_components/user-info-form';
import { getUserById } from '@/data/user';
import UserPasswordForm from './_components/user-password-form';
import { UserAuth } from '@/lib/get-current-user';
import { ProfileHeading } from './_components/heading';

const ProfilePage = async () => {
  const user = await UserAuth();
  const data = await getUserById(user!.id as string)
  return (
    <>
      <Heading title='Profile' description='' />
      <Separator />
      <main className="md:grid md:grid-cols-2 max-sm:space-y-4 gap-8">
        <ProfileHeading title="Personal Information" description="Manage your personal information" />
        <UserInfoForm initialData={data} />
      </main>
      <Separator />
      <main className="md:grid md:grid-cols-2 max-sm:space-y-4 gap-8">
        <ProfileHeading title="Password" description="Change your password" />
        <UserPasswordForm userId={user!.id as string} />
      </main>

    </>
  )
}

export default ProfilePage