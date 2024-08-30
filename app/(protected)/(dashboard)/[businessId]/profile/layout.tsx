
const ProfileLayout = ({ children }: {
    children: React.ReactNode
  }) => {
    return (
      <main className="flex-1 space-y-4 2xl:max-w-screen-xl xl:max-w-screen-lg pb-14 mx-auto w-full rounded h-full">
        {children}
      </main>
    )
  }
  
  export default ProfileLayout