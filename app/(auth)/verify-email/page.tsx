import AuthCard from "@/components/auth/AuthCard";
import React from "react";

const VerifyEmailPage = () => {
  return (
    <>
      <div className="md:hidden">
        <AuthCard mode="signup" variant="fullscreen" />
      </div>

      <div className="hidden md:flex min-h-screen items-center justify-center px-6">
        <AuthCard mode="verify-email" variant="card" />
      </div>
    </>
  );
};

export default VerifyEmailPage;