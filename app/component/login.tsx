'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { IoLogOut } from "react-icons/io5";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="space-y-2">
        <p className="text-white underline text-sm sm:text-base font-medium">
          Welcome, {session.user?.name}
        </p>
        <button
               onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition ease-in-out text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <IoLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition ease-in-out text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <FcGoogle className="w-5 h-5" />
      <span>Sign in with Google</span>
    </button>
  );
}
