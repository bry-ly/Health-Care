"use client";

import * as React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconHelp,
  IconSettings,
  IconStethoscope,
  IconBell,
  IconUser,
  IconHeartbeat,
  IconFileDescription,
  IconClipboardList,
  IconPrescription,
} from "@tabler/icons-react";

import Link from "next/link";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavDocuments } from "@/components/dashboard/nav-documents";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard/patient",
      icon: IconDashboard,
    },
    {
      title: "Book Appointment",
      url: "/dashboard/patient/book-appointment",
      icon: IconCalendar,
    },
    {
      title: "My Appointments",
      url: "/dashboard/patient/appointments",
      icon: IconCalendar,
    },
    {
      title: "Find Doctors",
      url: "/dashboard/patient/doctors",
      icon: IconStethoscope,
    },
    {
      title: "Notifications",
      url: "/dashboard/patient/notifications",
      icon: IconBell,
    },
  ];

  const documents = [
    {
      name: "Medical Records",
      url: "/dashboard/patient/records",
      icon: IconFileDescription,
    },
    {
      name: "Test Results",
      url: "/dashboard/patient/test-results",
      icon: IconClipboardList,
    },
    {
      name: "Prescriptions",
      url: "/dashboard/patient/prescriptions",
      icon: IconPrescription,
    },
  ];

  const navSecondary = [
    {
      title: "Profile",
      url: "/dashboard/patient/profile",
      icon: IconUser,
    },
    {
      title: "Settings",
      url: "/dashboard/patient/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/patient/help",
      icon: IconHelp,
    },
  ];

  const user = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "guest@example.com",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard/patient">
                <IconHeartbeat className="size-5!" />
                <span className="text-base font-semibold">
                  Patient Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          quickCreateLabel="Book Appointment"
          quickCreateUrl="/dashboard/patient/book-appointment"
        />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
