import React from "react";
import LoginForm from "../forms/LoginForm";
import SignUpForm from "../forms/SignUpForm";
import VerifyEmailForm from "../forms/VerifyEmailForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AuthCardProps } from "@/types/AuthTypes";

const AuthCard = ({ mode, variant = "card" }: AuthCardProps) => {
  const config = {
    login: {
      title: "Welcome Back",
      description: "Sign in with your credentials to continue",
      form: <LoginForm />,
    },
    signup: {
      title: "Create your account",
      description: "Create your account to get started",
      form: <SignUpForm />,
    },
    "verify-email": {
      title: "Verify your email",
      description: "Enter the confirmation code we sent to your email",
      form: <VerifyEmailForm />,
    },
  };

  const { title, description, form } = config[mode];

  const footerConfig = {
  login: {
    href: "/sign-up",
    label: "Don't have an account? Sign Up",
  },

  signup: {
    href: "/log-in",
    label: "Already have an account? Sign In",
  },

  "verify-email": {
    href: "/log-in",
    label: "Back to Sign In",
  },
}

const footerLink = footerConfig[mode]

  if (variant === "fullscreen") {
    return (
      <section className="min-h-screen flex flex-col justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>

          <div className="w-full">{form}</div>

          <div className="mt-6">
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>{form}</CardContent>

        <CardFooter className="flex flex-row justify-between">
        <a href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot your password?
        </a>
        <a
          href={footerLink.href}
          className="text-sm text-primary hover:underline"
        >
          {footerLink.label}
        </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthCard;