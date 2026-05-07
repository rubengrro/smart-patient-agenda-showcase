export type AuthMode = "login" | "signup" | "verify-email";
export type AuthVariant = "card" | "fullscreen";

export interface AuthCardProps {
  mode: AuthMode;
  variant?: AuthVariant;
}