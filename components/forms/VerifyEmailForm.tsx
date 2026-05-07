"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/lib/validations/authSchemas";
import { authClient } from "@/lib/auth-client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromQuery = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams]
  );

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: VerifyEmailFormValues) => {
    setServerError("");
    setSuccessMessage("");
    setResendMessage("");

    const { error } = await authClient.emailOtp.verifyEmail({
      email: data.email,
      otp: data.otp,
    });

    if (error) {
      setServerError(error.message ?? "Invalid or expired code");
      return;
    }

    setSuccessMessage("Email verified successfully. Redirecting to login...");
    router.push("/log-in");
  };

  const handleResendCode = async () => {
    setServerError("");
    setSuccessMessage("");
    setResendMessage("");

    if (!emailFromQuery) {
      setServerError("Missing email address");
      return;
    }

    setIsResending(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: emailFromQuery,
      type: "email-verification",
    });

    setIsResending(false);

    if (error) {
      setServerError(error.message ?? "Could not resend code");
      return;
    }

    setResendMessage("A new verification code was sent to your email");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verify-email">Email</Label>
        <Input
          id="verify-email"
          type="email"
          readOnly
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="verify-otp">Confirmation code</Label>
        <Input
          id="verify-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          {...register("otp")}
        />
        {errors.otp && (
          <p className="text-sm text-red-500">{errors.otp.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}
      {resendMessage && (
        <p className="text-sm text-green-600">{resendMessage}</p>
      )}

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendCode}
          disabled={isResending}
        >
          {isResending ? "Sending new code..." : "Resend code"}
        </Button>
      </div>
    </form>
  );
};

export default VerifyEmailForm;