// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm } from './types.server'
import { prisma } from './prisma.server'

export const createUser = async (user: RegisterForm/*, profileId : number*/) => {
  const passwordHash = await bcrypt.hash(user.password, 10)
  console.log(user)

  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      profileId: -1
    },
  })

  const newProfile = await prisma.profile.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: newUser.id
    }
  })

  prisma.user.update({
    where: {
      id: newUser.id,
    },
    data: {
      profileId: newProfile.id
    }
  })

  return { id: newUser.id, email: user.email }
}

export const getOtherUsers = async (userId: string) => {
  return prisma.user.findMany({
    where: {
      id: {not: Number(userId)},
    },
    orderBy: {
      profile: {
        firstName: 'asc',
      },
    },
  })
}

export const getOtherProfiles = async (userId: string) => {
  return prisma.profile.findMany({
    where: {
      userId: {not: Number(userId)},
    },
    orderBy: {
      firstName: "asc"
    },
  })
}