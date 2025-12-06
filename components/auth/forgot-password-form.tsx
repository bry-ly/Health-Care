"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  forgetPasswordEmailOtp,
  resetPasswordEmailOtp,
  sendVerificationOtp,
} from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { OTPVerification } from "./otp-verification";

type Step = "email" | "otp" | "reset";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (!email || !email.includes("@")) {
        setErrors({ email: "Please enter a valid email address" });
        setIsLoading(false);
        return;
      }

      // Check if user exists
      try {
        const checkUserResponse = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const checkUserData = await checkUserResponse.json();

        if (!checkUserData.exists) {
          setErrors({
            email: "No account found with this email address",
          });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking user:", error);
        // Continue anyway
      }

      // Send OTP for password reset
      const result = await forgetPasswordEmailOtp({ email });

      if (result.error) {
        setErrors({
          email: result.error.message || "Failed to send verification code",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Verification code sent! Please check your email.");
      setStep("otp");
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.";
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpValue: string) => {
    setOtp(otpValue);
    // Just store the OTP and move to reset step - actual verification happens on reset
    setStep("reset");
    return {};
  };

  const handleResendOTP = async () => {
    const result = await sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (result.error) {
      throw new Error(result.error.message || "Failed to resend code");
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate passwords
      if (!password || password.length < 8) {
        setErrors({ password: "Password must be at least 8 characters" });
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        setIsLoading(false);
        return;
      }

      // Reset the password
      const result = await resetPasswordEmailOtp({
        email,
        otp,
        password,
      });

      if (result.error) {
        const errorMessage = result.error.message || "";

        // Check for invalid/expired OTP
        if (
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("otp")
        ) {
          toast.error(
            "Invalid or expired verification code. Please try again."
          );
          setStep("email");
          setIsLoading(false);
          return;
        }

        setErrors({
          password: errorMessage || "Failed to reset password",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP Verification
  if (step === "otp") {
    return (
      <OTPVerification
        email={email}
        type="forget-password"
        onSuccess={() => {
          // This won't be called since we manually transition in handleOTPVerify
        }}
        onBack={() => setStep("email")}
        resendCallback={handleResendOTP}
        verifyCallback={handleOTPVerify}
        className={className}
      />
    );
  }

  // Step 3: Reset Password
  if (step === "reset") {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Set New Password</CardTitle>
            <CardDescription className="text-sm">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <form onSubmit={handleResetPassword}>
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm">
                    New Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                      className={cn(
                        "pr-10 h-9",
                        errors.password && "border-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.password}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword" className="text-sm">
                    Confirm New Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: undefined });
                        }
                      }}
                      className={cn(
                        "pr-10 h-9",
                        errors.confirmPassword && "border-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full h-9"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("email")}
                    className="w-full text-xs mt-2"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Start Over
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Email Input
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Forgot Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your email address and we&apos;ll send you a verification code
            to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-1">
          <form onSubmit={handleSendOTP}>
            <FieldGroup className="space-y-3">
              <Field>
                <FieldLabel htmlFor="email" className="text-sm">
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  className={cn("h-9", errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full h-9"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </Button>
                <FieldDescription className="text-center text-xs mt-3">
                  Remember your password?{" "}
                  <a href="/login" className="font-semibold hover:underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
