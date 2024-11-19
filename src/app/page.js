'use client';
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";


export default function UploadFile() {
  const { data: session } = useSession();
  // console.log(session.user?.email)


  return (
    <div>
      {!session ? (
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      ) : (
 <>{redirect('/note')}</>
      )}
    </div>
  );
}


