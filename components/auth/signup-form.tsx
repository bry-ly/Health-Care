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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signUp, sendVerificationOtp, verifyEmail } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { OTPVerification } from "./otp-verification";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupInput, string>>
  >({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data with Zod
      const validationResult = signupSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};

        // Handle all validation errors including refine errors
        validationResult.error.issues.forEach((err) => {
          const field = err.path[0] as keyof SignupInput;
          if (field) {
            // Only set error if field exists, prioritize first error per field
            if (!fieldErrors[field]) {
              fieldErrors[field] = err.message;
            }
          }
        });

        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Check if user already exists before attempting signup
      try {
        const checkUserResponse = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const checkUserData = await checkUserResponse.json();

        if (checkUserData.exists) {
          setShowLoginDialog(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking user:", error);
        // Continue to try signup anyway
      }

      // Sign up the user (default role is PATIENT)
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (result.error) {
        const errorMessage = result.error.message || "";
        const errorCode = result.error.code || "";

        // Check if user already exists
        if (
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("email already") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          errorCode === "USER_ALREADY_EXISTS" ||
          errorCode === "EMAIL_ALREADY_EXISTS"
        ) {
          setShowLoginDialog(true);
          setIsLoading(false);
          return;
        }

        // Set error message without toast
        setErrors({
          email: errorMessage || "Failed to create account",
        });
        setIsLoading(false);
        return;
      }

      // OTP is automatically sent by Better Auth when overrideDefaultEmailVerification is true
      // No need to manually send OTP here - it's already sent during signup
      toast.success("Verification code sent! Please check your email.");
      setShowOTPVerification(true);
      setIsLoading(false);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      setErrors({
        email: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[id as keyof SignupInput]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }
  };

  const handleOTPVerify = async (otp: string) => {
    const result = await verifyEmail({
      email: formData.email,
      otp,
    });

    if (result.error) {
      return {
        error: { message: result.error.message || "Verification failed" },
      };
    }

    toast.success("Email verified successfully! Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
    return {};
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    const result = await sendVerificationOtp({
      email: formData.email,
      type: "email-verification",
    });
    setIsSendingOTP(false);

    if (result.error) {
      throw new Error(result.error.message || "Failed to resend code");
    }
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={formData.email}
        type="email-verification"
        onSuccess={() => {
          router.push("/login");
        }}
        onBack={() => {
          setShowOTPVerification(false);
        }}
        resendCallback={handleResendOTP}
        verifyCallback={handleOTPVerify}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Create your account</CardTitle>
          <CardDescription className="text-sm">
            Enter your information to create your healthcare account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-1">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-1">
              <Field>
                <FieldLabel htmlFor="name" className="text-sm">
                  Full Name
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={handleChange}
                  className={cn("h-9", errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-sm">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange}
                  className={cn("h-9", errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </Field>
              <Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="password" className="text-sm">
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        value={formData.password}
                        onChange={handleChange}
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
                      Confirm
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                </div>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full h-9 lg:mt-0"
                  disabled={isLoading || isSendingOTP}
                >
                  {isLoading || isSendingOTP
                    ? "Creating account..."
                    : "Create Account"}
                </Button>
                <FieldDescription className="text-center text-xs">
                  Already have an account?{" "}
                  <a href="/login" className="font-semibold hover:underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-2 text-center text-xs lg:mt-0">
        By continuing, you agree to our{" "}
        <a href="#" className="hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
      </FieldDescription>

      {/* Account Already Exists Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Already Exists</DialogTitle>
            <DialogDescription>
              An account with the email{" "}
              <span className="font-medium">{formData.email}</span> already
              exists. Would you like to sign in instead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false);
                router.push("/login");
              }}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
