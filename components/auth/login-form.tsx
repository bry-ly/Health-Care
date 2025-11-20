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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signIn, sendVerificationOtp, getLastUsedLoginMethod } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { OTPVerification } from "./otp-verification";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);

  // Set default login method based on last used method
  useEffect(() => {
    const lastMethod = getLastUsedLoginMethod();
    if (lastMethod === "otp" || lastMethod === "password") {
      setLoginMethod(lastMethod);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate email
      if (!formData.email || !formData.email.includes("@")) {
        setErrors({
          email: "Please enter a valid email address",
        });
        setIsLoading(false);
        return;
      }

      if (loginMethod === "otp") {
        // Check if user exists before sending OTP
        try {
          const checkUserResponse = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email }),
          });

          const checkUserData = await checkUserResponse.json();

          if (!checkUserData.exists) {
            setShowSignUpDialog(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking user:", error);
          // Continue to try sending OTP anyway
        }

        // Send OTP for sign-in
        setIsSendingOTP(true);
        const otpResult = await sendVerificationOtp({
          email: formData.email,
          type: "sign-in",
        });

        if (otpResult.error) {
          // Check if user doesn't exist (fallback check)
          const errorMessage = otpResult.error.message || "";
          if (
            errorMessage.toLowerCase().includes("user not found") ||
            errorMessage.toLowerCase().includes("account not found") ||
            errorMessage.toLowerCase().includes("no account") ||
            errorMessage.toLowerCase().includes("user does not exist") ||
            otpResult.error.code === "USER_NOT_FOUND" ||
            otpResult.error.code === "INVALID_EMAIL"
          ) {
            setShowSignUpDialog(true);
            setIsSendingOTP(false);
            setIsLoading(false);
            return;
          }

          setErrors({
            email: errorMessage || "Failed to send verification code",
          });
          setIsSendingOTP(false);
          setIsLoading(false);
          return;
        }

        toast.success("Verification code sent! Please check your email.");
        setShowOTPVerification(true);
        setIsLoading(false);
        setIsSendingOTP(false);
        return;
      }

      // Password login
      // Validate form data with Zod
      const validationResult = loginSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
        
        // Handle all validation errors
        validationResult.error.issues.forEach((err) => {
          const field = err.path[0] as keyof LoginInput;
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

      // Check if user exists before attempting login
      try {
        const checkUserResponse = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const checkUserData = await checkUserResponse.json();

        if (!checkUserData.exists) {
          setShowSignUpDialog(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking user:", error);
        // Continue to try login anyway
      }

      // Sign in the user
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        // Check if user doesn't exist (fallback check)
        const errorMessage = result.error.message || "";
        const errorCode = result.error.code || "";
        
        // Check for user not found errors
        if (
          errorMessage.toLowerCase().includes("user not found") ||
          errorMessage.toLowerCase().includes("account not found") ||
          errorMessage.toLowerCase().includes("no account") ||
          errorMessage.toLowerCase().includes("user does not exist") ||
          errorCode === "USER_NOT_FOUND" ||
          errorCode === "INVALID_EMAIL"
        ) {
          setShowSignUpDialog(true);
          setIsLoading(false);
          return;
        }

        // Check for invalid password errors (user exists but wrong password)
        if (
          errorMessage.toLowerCase().includes("invalid password") ||
          errorMessage.toLowerCase().includes("incorrect password") ||
          errorMessage.toLowerCase().includes("wrong password") ||
          errorCode === "INVALID_PASSWORD" ||
          errorCode === "INVALID_CREDENTIALS"
        ) {
          setErrors({
            password: "Incorrect password. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        // Generic error for other cases
        setErrors({
          email: errorMessage || "Invalid email or password",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Login successful. Redirecting to dashboard...");

      // Use window.location.replace() to replace login page in history
      // This prevents going back to login page while preserving history before login
      // Full page reload ensures session cookie is properly recognized in production
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 500);
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to login. Please try again.";
      setErrors({
        email: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    const result = await signIn.emailOtp({
      email: formData.email,
      otp,
    });

    if (result.error) {
      // Check if user doesn't exist
      const errorMessage = result.error.message || "";
      if (
        errorMessage.toLowerCase().includes("user not found") ||
        errorMessage.toLowerCase().includes("account not found") ||
        errorMessage.toLowerCase().includes("no account") ||
        result.error.code === "USER_NOT_FOUND"
      ) {
        setShowOTPVerification(false);
        setShowSignUpDialog(true);
        return { error: { message: errorMessage } };
      }
      return { error: { message: errorMessage } };
    }

    toast.success("Login successful. Redirecting to dashboard...");
    setTimeout(() => {
      window.location.replace("/dashboard");
    }, 500);
    return {};
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    const result = await sendVerificationOtp({
      email: formData.email,
      type: "sign-in",
    });
    setIsSendingOTP(false);
    
    if (result.error) {
      throw new Error(result.error.message || "Failed to resend code");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[id as keyof LoginInput]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={formData.email}
        type="sign-in"
        onSuccess={() => {
          window.location.replace("/dashboard");
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Login to access your appointments and health information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* Login Method Toggle */}
              <Field>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={loginMethod === "password" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLoginMethod("password");
                      setErrors({});
                    }}
                    className="flex-1"
                  >
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === "otp" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLoginMethod("otp");
                      setErrors({});
                    }}
                    className="flex-1"
                  >
                    Email Code
                  </Button>
                </div>
              </Field>

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading || isSendingOTP}
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </Field>

              {/* Password Field - Only show for password login */}
              {loginMethod === "password" && (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="/forgot-password"
                      className="text-xs underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      value={formData.password}
                      onChange={handleChange}
                      className={cn("pr-10", errors.password && "border-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                </Field>
              )}

              {/* Submit Button */}
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading || isSendingOTP}>
                  {isLoading || isSendingOTP
                    ? loginMethod === "otp"
                      ? "Sending code..."
                      : "Logging in..."
                    : loginMethod === "otp"
                      ? "Send Verification Code"
                      : "Login"}
                </Button>
                <FieldDescription className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="font-semibold hover:underline">
                    Sign Up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        By logging in, you agree to our{" "}
        <a href="#" className="hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
      </FieldDescription>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Not Found</DialogTitle>
            <DialogDescription>
              We couldn&apos;t find an account with the email{" "}
              <span className="font-medium">{formData.email}</span>. Would you
              like to create a new account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSignUpDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSignUpDialog(false);
                router.push("/signup");
              }}
              className="w-full sm:w-auto"
            >
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
