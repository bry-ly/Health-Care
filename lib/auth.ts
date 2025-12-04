import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, lastLoginMethod } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "PATIENT",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let subject = "";
        let html = "";

        if (type === "sign-in") {
          subject = "Your Sign-In Verification Code";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Sign-In Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
                ${otp}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
          `;
        } else if (type === "email-verification") {
          subject = "Verify Your Email Address";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Email Verification Code</h2>
              <p>Please verify your email address using the code below:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
                ${otp}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
          `;
        } else {
          // forget-password
          subject = "Password Reset Verification Code";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Password Reset Code</h2>
              <p>Your password reset verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
                ${otp}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
          `;
        }

        await sendEmail({
          to: email,
          subject,
          html,
        });
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: false,
      overrideDefaultEmailVerification: true,
      disableSignUp: true, // Prevent automatic sign-up when user doesn't exist
    }),
    lastLoginMethod({
      customResolveMethod: (ctx) => {
        // Track password login
        if (ctx.path === "/sign-in/email") {
          return "password";
        }
        // Track OTP login
        if (ctx.path === "/sign-in/email-otp") {
          return "otp";
        }
        // Return null to use default logic for other methods
        return null;
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
