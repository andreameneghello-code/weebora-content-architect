"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products/new", label: "New Product", icon: PlusCircle },
]

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "W"

  return (
    <div className="flex h-screen bg-[#F5F4FA] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col bg-white border-r border-[#E4E0F0] shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#F0EDF8]">
          <Image
            src="/weebora-logo.png"
            alt="Weebora"
            width={120}
            height={32}
            className="object-contain object-left"
          />
        </div>

        {/* Label */}
        <div className="px-5 pt-4 pb-1">
          <span className="text-[10px] font-semibold text-[#9E9BAC] uppercase tracking-widest">
            Content Platform
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#EEE9FF] text-[#3A2895]"
                    : "text-[#6B6882] hover:bg-[#F5F2FF] hover:text-[#3A2895]"
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-[#3A2895]" : "text-[#9E9BAC]"}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3A2895]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 border-t border-[#F0EDF8]" />

        {/* User */}
        <div className="p-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F2FF] group transition-colors cursor-default">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="bg-[#EEE9FF] text-[#3A2895] text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#1A1530] truncate">
                {user.name ?? "Team Member"}
              </div>
              <div className="text-[10px] text-[#9E9BAC] truncate">{user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#EEE9FF]"
              title="Sign out"
            >
              <LogOut size={13} className="text-[#6B6882]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
