"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function SettingsSidebar({
  className,
  items,
  activeTab,
  onTabChange,
  ...props
}: SettingsSidebarProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant={activeTab === item.title ? "secondary" : "ghost"}
          className={cn(
            "justify-start",
            activeTab === item.title
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline"
          )}
          onClick={() => onTabChange(item.title)}
        >
          {item.title}
        </Button>
      ))}
    </nav>
  );
}

export default function DoctorSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [username, setUsername] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [bio, setBio] = useState("I am a medical professional.");

  const sidebarItems = [
    { title: "Profile", href: "#profile" },
    { title: "Account", href: "#account" },
    { title: "Appearance", href: "#appearance" },
    { title: "Notifications", href: "#notifications" },
    { title: "Display", href: "#display" },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call or call existing one
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Manage your account settings and set e-mail preferences.
              </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
              <aside className="-mx-4 lg:w-1/5">
                <SettingsSidebar
                  items={sidebarItems}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </aside>
              <div className="flex-1 lg:max-w-2xl">
                {activeTab === "Profile" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        This is how others will see you on the site.
                      </p>
                    </div>
                    <Separator />
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Dr. Name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                          This is your public display name. It can be your real
                          name or a pseudonym.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Select defaultValue={email} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={email}>{email}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground">
                          You can manage verified email addresses in your email
                          settings.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us a little bit about yourself"
                          className="resize-none"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                          You can @mention other users and organizations to link
                          to them.
                        </p>
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update profile"}
                      </Button>
                    </form>
                  </div>
                )}
                {activeTab !== "Profile" && (
                  <div className="flex h-[400px] flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">
                      {activeTab} settings coming soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
