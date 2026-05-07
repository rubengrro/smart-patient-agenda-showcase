import ResetPasswordForm from "@/components/forms/ResetPasswordForm"
export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password to regain access.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}