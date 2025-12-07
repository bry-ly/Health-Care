"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export function SiteHeader() {
  const pathname = usePathname();

  // Split pathname into segments, filter empty strings
  const segments = pathname?.split("/").filter((segment) => segment) || [];

  // Map segments to readable names
  const getBreadcrumbName = (segment: string) => {
    const mapping: Record<string, string> = {
      dashboard: "Dashboard",
      patient: "Patient",
      doctor: "Doctor",
      admin: "Admin",
      settings: "Settings",
      records: "Medical Records",
      appointments: "Appointments",
      schedule: "Schedule",
      notifications: "Notifications",
      users: "Users",
      profile: "Profile",
      "book-appointment": "Book Appointment",
      "medical-history": "Medical History",
      prescriptions: "Prescriptions",
      reports: "Reports",
      availability: "Availability",
      help: "Help",
      accounts: "Accounts",
      "missed-appointments": "Missed Appointments",
      staff: "Staff",
      "audit-logs": "Audit Logs",
      compliance: "Compliance",
    };

    return (
      mapping[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    );
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const name = getBreadcrumbName(segment);

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem className="hidden md:block">
                    {isLast ? (
                      <BreadcrumbPage>{name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
