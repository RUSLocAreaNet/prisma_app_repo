// app/routes/login.tsx
import { Layout } from '~/components/layout'
import { FormField} from "../components/formField"
import {useState} from "react"

export default function Login() {

    const [action, setAction] = useState('login')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: "",
    lastname: "",
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-5">

      <button
        onClick={() => setAction(action == 'login' ? 'register' : 'login')}
        className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
      >
        {action === 'login' ? 'Sign Up' : 'Sign In'}
      </button>

        <h2 className="text-5xl font-extrabold text-yellow-100">Greetings at SufferPoint!</h2>
        <p className="font-semibold text-slate-400">Log In To Use This Product I Suffered For!</p>

        <form method="post" className="rounded-2xl bg-gray-100 p-6 w-96">


          <FormField htmlFor="email" type="email" label="Email" value={formData.email} onChange={e => handleInputChange(e, "email")}></FormField>

          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={e => handleInputChange(e, 'password')}
          />

          <FormField
            htmlFor="firstname"
            type="firstname"
            label="firstname"
            value={formData.firstname}
            onChange={e => handleInputChange(e, 'firstname')}
          />

          <FormField
            htmlFor="lastname"
            type="lastname"
            label="lastname"
            value={formData.lastname}
            onChange={e => handleInputChange(e, 'lastname')}
          />

          <div className="w-full text-center">
            <input
              type="submit"
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
              value="Sign In"
            />
          </div>
        </form>
      </div>
    </Layout>
  )
}