import Link from 'next/link'
import { IconHeartbeat } from '@tabler/icons-react'

const links = [
    {
        group: 'For Patients',
        items: [
            {
                title: 'Book Appointment',
                href: '/dashboard/patient/book-appointment',
            },
            {
                title: 'My Appointments',
                href: '/dashboard/patient/appointments',
            },
            {
                title: 'Find Doctors',
                href: '/dashboard/patient/doctors',
            },
            {
                title: 'Medical Records',
                href: '/dashboard/patient/records',
            },
            {
                title: 'Help Center',
                href: '/dashboard/patient/help',
            },
        ],
    },
    {
        group: 'For Doctors',
        items: [
            {
                title: 'Doctor Dashboard',
                href: '/dashboard/doctor',
            },
            {
                title: 'Manage Appointments',
                href: '/dashboard/doctor/appointments',
            },
            {
                title: 'Set Availability',
                href: '/dashboard/doctor/availability',
            },
            {
                title: 'Patient Records',
                href: '/dashboard/doctor/patient-records',
            },
            {
                title: 'Schedule',
                href: '/dashboard/doctor/schedule',
            },
        ],
    },
    {
        group: 'Company',
        items: [
            {
                title: 'About Us',
                href: '#',
            },
            {
                title: 'Careers',
                href: '#',
            },
            {
                title: 'Blog',
                href: '#',
            },
            {
                title: 'Contact',
                href: '#',
            },
            {
                title: 'Support',
                href: '#',
            },
        ],
    },
    {
        group: 'Legal',
        items: [
            {
                title: 'Privacy Policy',
                href: '#',
            },
            {
                title: 'Terms of Service',
                href: '#',
            },
            {
                title: 'HIPAA Compliance',
                href: '#',
            },
            {
                title: 'Security',
                href: '#',
            },
        ],
    },
]

export default function FooterSection() {
    return (
        <footer className="border-b bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="flex items-center gap-2 size-fit">
                            <IconHeartbeat className="size-6 text-primary" />
                            <span className="text-xl font-semibold">healthcare</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="space-y-4 text-sm">
                                <span className="block font-medium">{link.group}</span>
                                {link.items.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary block duration-150">
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                    <span className="text-muted-foreground order-last block text-center text-sm md:order-first">© {new Date().getFullYear()} HealthCare, All rights reserved</span>
                    <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
                        <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="text-muted-foreground hover:text-primary block">
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"></path>
                            </svg>
                        </Link>
                        <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="text-muted-foreground hover:text-primary block">
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
                            </svg>
                        </Link>
                        <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Gmail"
                            className="text-muted-foreground hover:text-primary block">
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64L12 9.548l6.545-4.91l1.528-1.145C21.69 2.28 24 3.434 24 5.457z"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
