"use client";

import * as React from "react";
import {
  IconDashboard,
  IconHelp,
  IconSettings,
  IconBell,
  IconUser,
  IconHeartbeat,
  IconUsers,
  IconStethoscope,
  IconCalendarEvent,
  IconFileDescription,
  IconChartBar,
  IconClipboardList,
  IconAlertCircle,
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
      url: "/dashboard/admin",
      icon: IconDashboard,
    },
    {
      title: "Appointments",
      url: "/dashboard/admin/appointments",
      icon: IconCalendarEvent,
    },
    {
      title: "Missed Appointments",
      url: "/dashboard/admin/missed-appointments",
      icon: IconAlertCircle,
    },
    {
      title: "Patients",
      url: "/dashboard/admin/patients",
      icon: IconUsers,
    },
    {
      title: "Doctors",
      url: "/dashboard/admin/doctors",
      icon: IconStethoscope,
    },
    {
      title: "Accounts",
      url: "/dashboard/admin/accounts",
      icon: IconUser,
    },
    {
      title: "Staff",
      url: "/dashboard/admin/staff",
      icon: IconUser,
    },
    {
      title: "Notifications",
      url: "/dashboard/admin/notifications",
      icon: IconBell,
    },
  ];

  const documents = [
    {
      name: "System Reports",
      url: "/dashboard/admin/reports",
      icon: IconChartBar,
    },
    {
      name: "Audit Logs",
      url: "/dashboard/admin/audit-logs",
      icon: IconClipboardList,
    },
    {
      name: "Compliance",
      url: "/dashboard/admin/compliance",
      icon: IconFileDescription,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "/dashboard/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/admin/help",
      icon: IconHelp,
    },
  ];

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@example.com",
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
              <Link href="/dashboard/admin">
                <IconHeartbeat className="size-5!" />
                <span className="text-base font-semibold">Admin Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          quickCreateLabel="Add User"
          quickCreateUrl="/dashboard/admin/accounts?action=create"
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
