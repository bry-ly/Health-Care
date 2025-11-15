"use client";

import * as React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconHelp,
  IconSettings,
  IconClock,
  IconBell,
  IconUser,
  IconHeartbeat,
  IconUsers,
  IconClipboardList,
  IconFileDescription,
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
      url: "/dashboard/doctor",
      icon: IconDashboard,
    },
    {
      title: "Today's Schedule",
      url: "/dashboard/doctor/schedule",
      icon: IconCalendar,
    },
    {
      title: "Patients",
      url: "/dashboard/doctor/patients",
      icon: IconUsers,
    },
    {
      title: "Appointments",
      url: "/dashboard/doctor/appointments",
      icon: IconClock,
    },
    {
      title: "Notifications",
      url: "/dashboard/doctor/notifications",
      icon: IconBell,
    },
  ];

  const documents = [
    {
      name: "Patient Records",
      url: "/dashboard/doctor/patient-records",
      icon: IconFileDescription,
    },
    {
      name: "Prescriptions",
      url: "/dashboard/doctor/prescriptions",
      icon: IconPrescription,
    },
    {
      name: "Reports",
      url: "/dashboard/doctor/reports",
      icon: IconClipboardList,
    },
  ];

  const navSecondary = [
    {
      title: "Availability",
      url: "/dashboard/doctor/availability",
      icon: IconClock,
    },
    {
      title: "Profile",
      url: "/dashboard/doctor/profile",
      icon: IconUser,
    },
    {
      title: "Settings",
      url: "/dashboard/doctor/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/doctor/help",
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
              <Link href="/dashboard/doctor">
                <IconHeartbeat className="size-5!" />
                <span className="text-base font-semibold">Doctor Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          quickCreateLabel="Add Appointment"
          quickCreateUrl="/dashboard/doctor/add-appointment"
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
