"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

// Get baseURL - use environment variable if set, otherwise use current origin
// This ensures it works correctly in both development and production
const baseURL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || window.location.origin
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [emailOTPClient(), lastLoginMethodClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Export OTP methods from the client
export const sendVerificationOtp = authClient.emailOtp.sendVerificationOtp;
export const verifyEmail = authClient.emailOtp.verifyEmail;
export const forgetPasswordEmailOtp = authClient.forgetPassword.emailOtp;
export const resetPasswordEmailOtp = authClient.emailOtp.resetPassword;

// Export last login method helpers
export const getLastUsedLoginMethod = () => authClient.getLastUsedLoginMethod();
export const isLastUsedLoginMethod = (method: string) =>
  authClient.isLastUsedLoginMethod(method);
export const clearLastUsedLoginMethod = () =>
  authClient.clearLastUsedLoginMethod();
