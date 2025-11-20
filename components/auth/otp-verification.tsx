"use client";

import { useState, useEffect } from "react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

interface OTPVerificationProps {
  email: string;
  type: "sign-in" | "email-verification" | "forget-password";
  onSuccess: () => void;
  onBack?: () => void;
  resendCallback?: () => Promise<void>;
  verifyCallback: (otp: string) => Promise<{ error?: { message: string } }>;
  className?: string;
}

export function OTPVerification({
  email,
  type,
  onSuccess,
  onBack,
  resendCallback,
  verifyCallback,
  className,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0); // Resend cooldown
  const [otpTimer, setOtpTimer] = useState(300); // OTP expiration timer (5 minutes = 300 seconds)

  // Resend cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // OTP expiration timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // OTP expired
      setError("Verification code has expired. Please request a new one.");
    }
  }, [otpTimer]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyCallback(otp);

      if (result.error) {
        setError(result.error.message || "Invalid verification code");
        setOtp("");
        return;
      }

      toast.success("Verification successful!");
      setOtpTimer(0); // Stop timer on success
      onSuccess();
    } catch (error: unknown) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to verify code. Please try again.";
      setError(errorMessage);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !resendCallback) return;

    setIsResending(true);
    setError(null);
    setOtp("");

    try {
      await resendCallback();
      setCountdown(60); // 60 second cooldown
      setOtpTimer(300); // Reset OTP expiration timer (5 minutes)
      setError(null); // Clear any expiration errors
      toast.success("Verification code sent! Please check your email.");
    } catch (error: unknown) {
      console.error("Resend error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "sign-in":
        return "Enter Verification Code";
      case "email-verification":
        return "Verify Your Email";
      case "forget-password":
        return "Enter Reset Code";
      default:
        return "Enter Verification Code";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "sign-in":
        return "We've sent a 6-digit verification code to your email. Please enter it below to sign in.";
      case "email-verification":
        return "We've sent a 6-digit verification code to your email. Please enter it below to verify your email address.";
      case "forget-password":
        return "We've sent a 6-digit verification code to your email. Please enter it below to reset your password.";
      default:
        return "We've sent a 6-digit verification code to your email. Please enter it below.";
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
          <CardDescription className="text-sm">
            {getDescription()}
          </CardDescription>
          <CardDescription className="text-xs font-medium mt-2">
            {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-1">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="otp" className="text-sm text-center">
                Verification Code
              </FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading || otpTimer === 0}
                  containerClassName="gap-3"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-14 w-14 text-xl font-semibold" />
                    <InputOTPSlot index={1} className="h-14 w-14 text-xl font-semibold" />
                    <InputOTPSlot index={2} className="h-14 w-14 text-xl font-semibold" />
                    <InputOTPSlot index={3} className="h-14 w-14 text-xl font-semibold" />
                    <InputOTPSlot index={4} className="h-14 w-14 text-xl font-semibold" />
                    <InputOTPSlot index={5} className="h-14 w-14 text-xl font-semibold" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div
                  className={cn(
                    "text-xs font-medium",
                    otpTimer <= 60 && otpTimer > 0
                      ? "text-destructive"
                      : otpTimer === 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  )}
                >
                  {otpTimer > 0 ? (
                    <>
                      Code expires in:{" "}
                      <span className="font-mono font-bold">
                        {formatTimer(otpTimer)}
                      </span>
                    </>
                  ) : (
                    "Code expired"
                  )}
                </div>
              </div>
              {error && (
                <p className="text-xs text-destructive mt-2 text-center">
                  {error}
                </p>
              )}
            </Field>

            <Field>
              <Button
                type="button"
                onClick={handleVerify}
                className="w-full h-9"
                disabled={isLoading || otp.length !== 6 || otpTimer === 0}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </Field>

            <Field>
              <div className="flex flex-col items-center gap-2">
                {resendCallback && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending || countdown > 0}
                    className="text-xs"
                  >
                    {isResending
                      ? "Sending..."
                      : countdown > 0
                        ? `Resend code in ${countdown}s`
                        : "Resend verification code"}
                  </Button>
                )}
                {onBack && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Back
                  </Button>
                )}
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}

