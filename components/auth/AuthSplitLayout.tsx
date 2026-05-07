import AuthCard from "@/components/auth/AuthCard"

interface AuthSplitLayoutProps {
  mode: "login" | "signup" | "verify-email"
}

const AuthSplitLayout = ({ mode }: AuthSplitLayoutProps) => {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-6">
    <div
        className="grid min-h-[85vh] w-full max-w-7xl overflow-hidden rounded-3xl border bg-card shadow-2xl lg:grid-cols-2">
        <section className="hidden border-r bg-muted/30 lg:flex">
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-10">
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-muted" />

            <div className="relative z-10">
              <p className="text-sm font-semibold text-primary">
                SmartAgenda
              </p>
              <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
                Manage your clinic with operational clarity.
              </h1>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Scheduling, patients, inventory and clinical workflow tools in
                one workspace.
              </p>
            </div>

            <div className="relative z-10 rounded-2xl border bg-background/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-medium">
                Intelligent scheduling for modern clinics
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prevent overlaps, validate availability and keep operations
                under control.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-10 py-10">
          <AuthCard mode={mode} variant="card" />
        </section>
      </div>
    </main>
  )
}

export default AuthSplitLayout