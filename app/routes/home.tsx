import { json,LoaderFunction } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel'
import { getOtherUsers, getOtherProfiles } from '~/utils/user.server'
import { useLoaderData, useParams } from '@remix-run/react'
import { User, Profile } from '@prisma/client'

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const users = await getOtherUsers(userId)
  const profiles = await getOtherProfiles(userId)
  //const data = {"users": users, "profiles": profiles}
  return json([users, profiles])
}

export default function Home() {
  const [users, profiles] = useLoaderData()

  console.log("users : " + users + ", Profiles : " + profiles)

  console.log("DATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + users)
  console.log(users)

  console.log(profiles)

  return (
    <Layout>
      <div className="h-full flex">
        <UserPanel users = {users} profiles={profiles}/>
        <div className="flex-1"></div>
      </div>
    </Layout>
  )
}