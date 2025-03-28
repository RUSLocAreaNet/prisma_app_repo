import type { RegisterForm, LoginForm } from './types.server'
import { prisma } from './prisma.server'
import { redirect, json, createCookieSessionStorage } from '@remix-run/node'
import { createUser} from './user.server'
import bcrypt from 'bcryptjs'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
    cookie: {
      name: 'kudos-session',
      secure: process.env.NODE_ENV === 'production',
      secrets: [sessionSecret],
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  })

  interface user
  {
    email : string,
    id : number
  }

export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({ where: { email: user.email } })
  if (exists) {
    return json({ error: `User already exists with that email` }, { status: 400 })
  }
  //const profileNumber = await CreateProfile(user)
  const newUser = await createUser(user)
if (!newUser) {
  return json(
    {
      error: `Something went wrong trying to create a new user.`,
      fields: { email: user.email, password: user.password },
    },
    { status: 400 },
  )
}

return createUserSession(String(newUser.id), '/');
}



export async function login({ email, password }: LoginForm) {
    // 2
    const user = await prisma.user.findUnique({
      where: { email },
    })
  
    // 3
    if (!user || !(await bcrypt.compare(password, user.password)))
      return json({ error: `Incorrect login` }, { status: 400 })
  
    // 4
    return createUserSession(String(user.id), "/");
  }


  export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession()
    session.set('userId', userId)
    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': await storage.commitSession(session),
      },
    })
  }

  export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (!userId || typeof userId !== 'string') {
      const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
      throw redirect(`/login?${searchParams}`)
    }
    return Number(userId)
  }
  
  function getUserSession(request: Request) {
    return storage.getSession(request.headers.get('Cookie'))
  }
  
  async function getUserId(request: Request) {
    const session = await getUserSession(request)
    const userId = session.get('userId')
    if (!userId || typeof userId !== 'string') return null
    return userId
  }
  
  export async function getUser(request: Request) {
    const userId = await getUserId(request)
    if (typeof userId !== 'string') {
      return null
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, email: true},
      })

      return user
    } catch {
      throw logout(request)
    }
  }

  export async function getUserWithProfile(request: Request) {
    const userId = await getUserId(request)
    if (typeof userId !== 'string') {
      return null
    }
  
    try {
      const user : any = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, email: true},
      })

      const profile = await prisma.profile.findUnique({
        where: { userId: Number(userId) }
      })

      const userWithProfile = {user, profile}

      return userWithProfile
    } catch {
      throw logout(request)
    }
  }
  
  export async function logout(request: Request) {
    const session = await getUserSession(request)
    return redirect('/login', {
      headers: {
        'Set-Cookie': await storage.destroySession(session),
      },
    })
  }