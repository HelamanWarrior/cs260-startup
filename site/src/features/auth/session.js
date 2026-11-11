// Ask the server whether the auth cookie is still valid. This is the source of
// truth: localStorage can lie (e.g. a privacy browser cleared the token cookie
// but kept the stored user name), which otherwise leaves the app looking logged
// in while every API call fails with 401.
//
// Returns one of:
//   { status: 'authenticated', email }  - cookie is valid
//   { status: 'unauthenticated' }       - no/expired cookie (force re-login)
//   { status: 'unknown' }               - couldn't reach the server (stay as-is)
export async function verifySession() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const { email } = await res.json();
      return { status: 'authenticated', email };
    }
    if (res.status === 401) return { status: 'unauthenticated' };
    return { status: 'unknown' }; // server error: don't punish the user
  } catch {
    return { status: 'unknown' }; // offline/network error
  }
}
