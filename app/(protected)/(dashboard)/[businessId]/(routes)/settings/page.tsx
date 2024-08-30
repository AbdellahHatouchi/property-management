import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ProfileHeading } from "../../profile/_components/heading"
import SettingForm from "./_components/setting-form"
import { UserAuth } from "@/lib/get-current-user"
import { signOut } from "next-auth/react"
import { db } from "@/lib/db"

const SettingPage = async () => {
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
  const data = {
    showAPIDoc: userData?.showAPIDocs || false
  }

  return (
    <div className="p-3 space-y-4">
      <Heading title='Setting' description='mange the confegartion of your app' />
      <Separator />
      <main className="md:grid md:grid-cols-2 max-sm:space-y-4 gap-8">
        <ProfileHeading title="Developper Section" description="Manage access to API doc" />
        <SettingForm data={data} />
      </main>
    </div>
  )
}

export default SettingPage