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
      profileId: -3
    },
  })

  console.log(newUser);
  const newProfile = await prisma.profile.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: newUser.id
    }
  })

  console.log(newProfile);
  await prisma.user.update({
    where: {
      id: newUser.id,
    },
    data: {
      profileId: newProfile.id
    }
  })

  var checkNewUser = await prisma.user.findFirst(
    {
      where: {
        id: newUser.id
      }
    })
  
    console.log("CHECKED NEW USER: " + checkNewUser)

  return { id: newUser.id, email: user.email }
}

export const getOtherUsers = async (userId: number) => {
  return prisma.user.findMany({
    where: {
      id: {not: userId},
    },
    orderBy: {
      profile: {
        firstName: 'asc',
      },
    },
  })
}

export const getOtherProfiles = async (userId: number) => {
  return prisma.profile.findMany({
    where: {
      userId: {not: userId},
    },
    orderBy: {
      firstName: "asc"
    },
  })
}

export const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
}

export const getProfileByUserId = async (userId: number) => {
  return await prisma.profile.findUnique({
    where: {
      userId: userId
    },
  })
}