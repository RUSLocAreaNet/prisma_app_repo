import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node'
import { useLoaderData, useActionData } from '@remix-run/react'
import { getProfileByUserId, getUserById } from '~/utils/user.server'
import { Portal } from '~/components/portal'
import { Modal } from '~/components/modal';
import { getUser } from '~/utils/auth.server'

import { UserCircle } from '~/components/user-circle'
import { useState } from 'react'
import { KudoStyle } from '@prisma/client'

import { SelectBox } from '~/components/select-box'
import { colorMap, emojiMap } from "~/utils/constants";

import { Kudo } from '~/components/kudo'

import { requireUserId } from '~/utils/auth.server'
import { createKudo } from '~/utils/kudos.server'

export const loader: LoaderFunction = async ({ request, params }) => {


  const { userId } = params
  let userIdNumber : number
  console.log(userId)

  if (typeof userId !== 'number') {
    console.log("its not number!")
    userIdNumber = Number(userId)
    //return redirect('/home')
  }
  else{
    userIdNumber = userId
  }

  if (typeof userIdNumber !== 'number') {
    console.log("Double check, its not number!")

  }

  const recipient = await getUserById(userIdNumber)
  const user = await getUser(request)
  const recipientProfile = await getProfileByUserId(userIdNumber)
  const userProfile = await getProfileByUserId(user.id)

  console.log(recipient)
  console.log(recipientProfile)

  return {recipient, recipientProfile, user, userProfile}
}




export const action: ActionFunction = async ({ request }) => {
  const userId = Number(await requireUserId(request))
  // 2
  const form = await request.formData()
  const message = form.get('message')
  const backgroundColor = form.get('backgroundColor')
  const textColor = form.get('textColor')
  const emoji = form.get('emoji')
  const recipientId = Number(form.get('recipientId'))
  // 3
  if (
    typeof message !== 'string' ||
    typeof recipientId !== 'number' ||
    typeof backgroundColor !== 'string' ||
    typeof textColor !== 'string' ||
    typeof emoji !== 'string'
  ) {
    return json({ error: `Invalid Form Data` }, { status: 400 })
  }
  if (!message.length) {
    return json({ error: `Please provide a message.` }, { status: 400 })
  }
  if (!recipientId) {
    return json({ error: `No recipient found...` }, { status: 400 })
  }
  // 4
  await createKudo(message, userId, recipientId, {id: 0, backgroundColor, textColor, emoji})
  // 5
  return redirect('/home')
}




export default function KudoModal() {
  // 2

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData(data => ({
        ...data, style: {
            ...data.style,
            [field]: e.target.value
        }
    }))
}


const getOptions = (data: any) => Object.keys(data).reduce((acc: any[], curr) => {
    acc.push({
        name: curr.charAt(0).toUpperCase() + curr.slice(1).toLowerCase(),
        value: curr
    })
    return acc
}, [])


const colors = getOptions(colorMap)
const emojis = getOptions(emojiMap)


  const actionData = useActionData()
  const [formError] = useState(actionData?.error || '')
  const [formData, setFormData] = useState({
    message: '',
    style: {
      backgroundColor: 'RED',
      textColor: 'WHITE',
      emoji: 'THUMBSUP',
    } as KudoStyle,
  })
  
    // 3
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData(data => ({ ...data, [field]: e.target.value }))
  }
  
    const {
      recipient, recipientProfile, 
      user, userProfile
    } : any = useLoaderData()
  
    // 4
    return (
      <Modal isOpen={true} className="w-2/3 p-10">
        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full mb-2">{formError}</div>
        <form method="post">
          <input type="hidden" value={recipient.id} name="recipientId" />
          <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0">
            <div className="text-center flex flex-col items-center gap-y-2 pr-8">
              <UserCircle profile={recipientProfile} className="h-24 w-24" />
              <p className="text-blue-300">
                {recipientProfile.firstName} {recipientProfile.lastName}
              </p>
              {recipientProfile.department && (
                <span className="px-2 py-1 bg-gray-300 rounded-xl text-blue-300 w-auto">
                  {recipientProfile.department[0].toUpperCase() + recipientProfile.department.toLowerCase().slice(1)}
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-y-4">
              <textarea
                name="message"
                className="w-full rounded-xl h-40 p-4"
                value={formData.message}
                onChange={e => handleChange(e, 'message')}
                placeholder={`Say something nice about ${recipientProfile.firstName}...`}
              />
              <div className="flex flex-col items-center md:flex-row md:justify-start gap-x-4">
                <SelectBox
                    options={colors}
                    name="backgroundColor"
                    value={formData.style.backgroundColor}
                    onChange={e => handleStyleChange(e, 'backgroundColor')}
                    label="Background Color"
                    containerClassName="w-36"
                    className="w-full rounded-xl px-3 py-2 text-gray-400"
                />
                <SelectBox
                  options={colors}
                  name="textColor"
                  value={formData.style.textColor}
                  onChange={e => handleStyleChange(e, 'textColor')}
                  label="Text Color"
                  containerClassName="w-36"
                  className="w-full rounded-xl px-3 py-2 text-gray-400"
                />
                <SelectBox
                  options={emojis}
                  label="Emoji"
                  name="emoji"
                  value={formData.style.emoji}
                  onChange={e => handleStyleChange(e, 'emoji')}
                  containerClassName="w-36"
                  className="w-full rounded-xl px-3 py-2 text-gray-400"
                />
              </div>
            </div>
          </div>
          <br />
          <p className="text-blue-600 font-semibold mb-2">Preview</p>
          <div className="flex flex-col items-center md:flex-row gap-x-24 gap-y-2 md:gap-y-0">


          <Kudo profile={userProfile} kudo={formData} />


            <div className="flex-1" />
            <button
              type="submit"
              className="rounded-xl bg-yellow-300 font-semibold text-blue-600 w-80 h-12 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              Send
            </button>
          </div>
        </form>
      </Modal>
    )
  }