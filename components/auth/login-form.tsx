"use client";

import { useState } from "react";
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
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
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

      // Sign in the user
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        // Set error message without toast
        setErrors({
          email: result.error.message || "Invalid email or password",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Login successful. Redirecting to dashboard...");

      // Use window.location for full page reload to ensure session cookie is picked up
      // This is especially important in production where cookies need to be properly set
      setTimeout(() => {
        window.location.href = "/dashboard";
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
              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </Field>

              {/* Password Field */}
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
              {/* Submit Button */}
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
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
    </div>
  );
}
