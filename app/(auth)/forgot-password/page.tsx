import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we will send a password reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}