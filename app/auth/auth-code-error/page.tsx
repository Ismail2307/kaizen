import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-kaizen-950/20 to-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-kaizen-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-kaizen-700/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold">Confirmation link problem</h1>
        <p className="text-sm text-muted-foreground">
          This link is invalid or has expired. Try signing in again, or request a new confirmation email.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-kaizen-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kaizen-600"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}