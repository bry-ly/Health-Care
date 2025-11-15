import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { IconHeartbeat } from "@tabler/icons-react";

export default function SignupPage() {
  return (
    <div className="bg-muted flex lg:h-screen min-h-svh md:min-h-screen flex-col items-center justify-center gap-4 overflow-y-auto p-4 md:p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <IconHeartbeat className="size-4" />
          </div>
          Healthcare
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
