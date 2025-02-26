import { prisma } from './prisma.server'
import { KudoStyle, Prisma } from '@prisma/client'

export const createKudo = async (message: string, userId: number, recipientId: number, style : KudoStyle) => {
  let CreatedKudo = await prisma.kudo.create({
    data: {
      // 1
      message: message,
      styleId: null,
      // 2
      authorId: userId,
      recipientId: recipientId
    },
  })

  let createdStyle = await prisma.kudoStyle.create(
    {
        data: {
            id: CreatedKudo.id,
            backgroundColor: style.backgroundColor,
            textColor: style.textColor,
            emoji: style.emoji
        }
    })

    await prisma.kudo.update({
        where:
        {
            id: CreatedKudo.id
        },
        data:
        {
            styleId: createdStyle.id
        }
    })
}


export const getRecentKudos = async () => {
  const profiles = await prisma.profile.findMany(
    {
      select:
      {
        firstName: true,
        lastName: true,
        userId: true,
      }
    }
  )

  const styles = await prisma.kudoStyle.findMany(
    {
      select:
      {
        emoji: true,
        id : true
      }
    }
  )


  const kudos = await prisma.kudo.findMany(
  {
    take: 3,
    orderBy: 
    {
      createdAt: 'desc',
    },


    select: 
    {
      styleId: true,
      recipientId: true
    },
  })

  const kudosWithProfilesAndEmojis = 
  await kudos.map(
    (kudo) => 
    {
      return {
        profile : profiles.find((profile) => { if(profile.userId == kudo.recipientId) {return profile}}),
        style: styles.find((style) => { if(style.id == kudo.styleId) {return style} })
      }
    }
  )

  console.log("kudos", kudos)
  console.log("profiles", profiles)
  console.log("styles", styles)

  console.log(kudosWithProfilesAndEmojis)

  return kudosWithProfilesAndEmojis
}


export const getFilteredKudos = async (
    userId: number,
    sortFilter: Prisma.KudoOrderByWithRelationInput,
    whereFilter: Prisma.KudoWhereInput,
  ) => {
    return await prisma.kudo.findMany({
      select: {
        id: true,
        authorId: true,
        style: true,
        message: true,
        author: {
          select: {
            profile: true,
          },
        },
      },
      orderBy: {
        ...sortFilter,
      },
      where: {
        recipientId: userId,
        ...whereFilter,
      },
    })
  }