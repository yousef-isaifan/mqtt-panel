'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/'
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}
