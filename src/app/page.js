'use client';
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";


export default function UploadFile() {
  const { data: session } = useSession();
  // console.log(session.user?.email)


  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center">
       <h1 className="text-2xl font-bold  text-white">Daily Journal</h1>
       <p className="mb-4 w-64 text-center px-4 py-2 text-sm text-white">Soothing generated wallpapers and Google Drive backup</p>
      {!session ? (
        <>
        <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={() => signIn("google")}>Sign In with Google</button>
      
      </>
      ) : (
 <>{redirect('/note')}</>
      )}
    </div>
  );
}


