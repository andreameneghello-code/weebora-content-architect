import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

const providers = []

// Bypass provider — allows login without Google OAuth configured
// Remove this once GOOGLE_CLIENT_ID is set up
providers.push(
  Credentials({
    id: "bypass",
    name: "Bypass",
    credentials: {},
    authorize() {
      return {
        id: "weebora-user",
        name: "Weebora Team",
        email: "team@weebora.com",
        image: null,
      }
    },
  })
)

// Google OAuth — enabled only when credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, profile, credentials }) {
      // Always allow bypass login
      if (account?.provider === "bypass") return true
      // Restrict Google login to @weebora.com
      if (account?.provider === "google") {
        return (profile?.email ?? "").endsWith("@weebora.com")
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ""
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
