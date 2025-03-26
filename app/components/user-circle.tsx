import { Profile } from '@prisma/client'

interface props {
  profile: Profile
  className?: string
  onClick?: (...args: any) => any
}

export function UserCircle({ profile, onClick, className }: props) {

  if(profile.profilePicture == "NULL")
  {
    console.log("PROFILE IM DRAWING ATM: " + profile.firstName + " " + profile.lastName)

    return (
      <div
        className={`${className} cursor-pointer bg-gray-400 rounded-full flex justify-center items-center`}
        onClick={onClick}
      >
        <h2>
          {profile.firstName.charAt(0).toUpperCase()}
          {profile.lastName.charAt(0).toUpperCase()}
        </h2>
      </div>
    )
  }

  else{
    console.log("PROFILE IM DRAWING ATM: " + profile.firstName + " " + profile.lastName)

    console.log("PROFILE PICTURE ADDRESS:" + profile.profilePicture);
    let path = "/pps/" + profile.profilePicture;

    console.log("PROFILE PICTURE PATH:" + path);
    
    return (
      <div
        className={`${className} cursor-pointer overflow-hidden bg-gray-400 rounded-full flex justify-center items-center`}
        onClick={onClick}>
        <img src={path} className="object-fill"/>
      </div>
    )
  }

}