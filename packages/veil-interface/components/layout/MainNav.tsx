"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletButton from "@/components/common/WalletButton/index"
import { useFhevm } from "@/lib/hooks"

export function MainNav() {
  const pathname = usePathname()
  const { status: fhevmStatus } = useFhevm()

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg className="w-5 h-5 sm:w-7 sm:h-7 text-background" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-foreground text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors">
                Veil
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Encrypted Whitelist</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/veil/campaigns"
              className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all ${
                isActive("/veil/campaigns")
                  ? "bg-primary text-background shadow-lg shadow-primary/30"
                  : "text-foreground/80 hover:text-primary hover:bg-primary/10"
              }`}
            >
              <span className="hidden sm:inline">Campaigns</span>
              <span className="sm:hidden">Manage</span>
            </Link>

            {fhevmStatus === "ready" && (
              <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-semibold">FHE Ready</span>
              </div>
            )}

            <WalletButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
