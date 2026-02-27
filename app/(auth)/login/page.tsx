import Image from "next/image"
import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  const googleReady = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4FA]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#EEE9FF] opacity-60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E6F9F8] opacity-60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(58,40,149,0.12)] border border-[#E4E0F0] p-10 animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/weebora-logo.png"
              alt="Weebora"
              width={150}
              height={40}
              className="object-contain mb-5"
            />
            <div className="w-full h-px bg-[#F0EDF8]" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#1A1530] mb-2">Content Architect</h1>
            <p className="text-sm text-[#6B6882] leading-relaxed">
              Internal platform for the Weebora content team.
            </p>
          </div>

          {/* Sign in button */}
          <form
            action={async () => {
              "use server"
              await signIn(googleReady ? "google" : "bypass", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-3 rounded-full border border-[#E4E0F0] bg-white text-[#1A1530] text-sm font-semibold hover:bg-[#F5F2FF] hover:border-[#3A2895] transition-all shadow-sm group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="group-hover:text-[#3A2895] transition-colors">Sign in with Google</span>
            </button>
          </form>

          <p className="text-center text-[11px] text-[#9E9BAC] mt-5">
            {googleReady
              ? <>Restricted to <strong className="text-[#6B6882]">@weebora.com</strong> accounts</>
              : "Development mode — click to enter"
            }
          </p>
        </div>

        <p className="text-center text-[11px] text-[#9E9BAC] mt-5">
          © {new Date().getFullYear()} Weebora · Internal Tool
        </p>
      </div>
    </div>
  )
}
