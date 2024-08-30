import { DEFAUIT_LOGIN_REDIRECT } from '@/routes'
import Link from 'next/link'

export const NotFound = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{`Oups! The page searched is not found.`}</p>
        <p className="text-lg text-gray-600 mb-8">{`It seems that the page you are looking for has been moved or does not exist.`}</p>
        <Link href={DEFAUIT_LOGIN_REDIRECT} className="text-blue-500 hover:underline text-lg font-semibold">{`Back to home page`}</Link>
      </div>
    </div>
  )
}
