// this list of route don't require authentication

export const publicRoutes = [
  '/',
]

// array of routes used authentication

export const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/auth/reset-password',
]

// the prefix for PAI authentication routes

export const apiAuthPrefix = '/api/auth'

// the default route redirect after authentication or login

export const DEFAUIT_LOGIN_REDIRECT = '/'