import { json,LoaderFunction } from '@remix-run/node'
import { requireUserId, getUser, getUserWithProfile } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel'
import { getOtherUsers, getOtherProfiles } from '~/utils/user.server'
import { useLoaderData, useParams, Outlet } from '@remix-run/react'
import { Kudo as IKudo, Profile, Prisma } from '@prisma/client'

import { SearchBar } from '~/components/searchbar'

// app/routes/home.tsx
import { RecentBar } from '~/components/recent-bar'
import { getFilteredKudos, getRecentKudos } from '~/utils/kudos.server'
import { Kudo } from '~/components/kudo'


interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile
  }
}


export const loader: LoaderFunction = async ({ request }) => {
  const userId = await Number(await requireUserId(request))
  console.log("user id = " + userId)
  const users = await getOtherUsers(userId)
  console.log("users = " + await users)
  const profiles = await getOtherProfiles(userId)
  //const data = {"users": users, "profiles": profiles}

  const url = new URL(request.url)
  const sort = url.searchParams.get('sort')
  const filter = url.searchParams.get('filter')

  let sortOptions: Prisma.KudoOrderByWithRelationInput = {}
  if (sort) {
    if (sort === 'date') {
      sortOptions = { createdAt: 'desc' }
    }
    if (sort === 'sender') {
      sortOptions = { author: { profile: { firstName: 'asc' } } }
    }
    if (sort === 'emoji') {
      sortOptions = { style: { emoji: 'asc' } }
    }
  }

  let textFilter: Prisma.KudoWhereInput = {}
  if (filter) {
    textFilter = {
      OR: [
        { message: { mode: 'insensitive', contains: filter } },
        {
          author: {
            OR: [
              { profile: { is: { firstName: { mode: 'insensitive', contains: filter } } } },
              { profile: { is: { lastName: { mode: 'insensitive', contains: filter } } } },
            ],
          },
        },
      ],
    }
  }

  const kudos = await getFilteredKudos(userId, sortOptions, textFilter)
  const recentKudos = await getRecentKudos()

  const currentUser = await getUserWithProfile(request)

  return json({users, profiles, kudos, recentKudos, currentUser})
}

export default function Home() {
  const {users, profiles, kudos, recentKudos, currentUser} : any = useLoaderData()

  console.log("ALL PROFILES")

  console.log("Current user: ", currentUser)
  console.log("recent kudos", recentKudos)

  let ProfilesArray : any[] = Object.keys(profiles).map((key) => profiles[key]);
  let KudosArray : any[] = Object.keys(kudos).map((key) => kudos[key]);
  console.log(ProfilesArray)
  console.log(KudosArray)
  //profiles.foreach((profile : any) => {console.log(profile)})
  console.log("TOTAL PROFILES AMOUNT: " + ProfilesArray.length)


  console.log("users : " + users + ", Profiles : " + profiles, "Kudos : " + kudos)

  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} profiles={profiles}/>
        <div className="flex-1 flex flex-col">
          {/* Search Bar Goes Here */}
          <SearchBar profile={currentUser.profile}/>
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={ProfilesArray.find((profile : Profile) => profile.userId === kudo.authorId)} />
              ))}
            </div>
            {/* Recent Kudos Goes Here */}
            <RecentBar kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  )
}