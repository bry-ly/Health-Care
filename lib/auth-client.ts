"use client";

import { createAuthClient } from "better-auth/react";

// Get baseURL - use environment variable if set, otherwise use current origin
// This ensures it works correctly in both development and production
const baseURL = 
  typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin)
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
