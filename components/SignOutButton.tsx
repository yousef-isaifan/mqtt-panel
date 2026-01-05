'use client';

import { signOut, useSession } from 'next-auth/react';

export default function SignOutButton() {
  const { data: session } = useSession();
  const fullLogout = process.env.NEXT_PUBLIC_KEYCLOAK_FULL_LOGOUT === 'true';

  const handleSignOut = async () => {
    if (fullLogout) {
      // Full logout: Clear both app and Keycloak session
      const keycloakLogoutUrl = new URL(
        `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
      );
      
      if (session?.idToken) {
        keycloakLogoutUrl.searchParams.set('id_token_hint', session.idToken);
      }
      keycloakLogoutUrl.searchParams.set(
        'post_logout_redirect_uri',
        window.location.origin
      );

      // Sign out from NextAuth and redirect to Keycloak logout
      await signOut({ redirect: false });
      window.location.href = keycloakLogoutUrl.toString();
    } else {
      // App-only logout: Keycloak SSO session preserved (quick re-login)
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    }
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
