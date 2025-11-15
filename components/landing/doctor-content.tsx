import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-32" id="doctor-content">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-medium">Streamline your practice and focus on what matters most — patient care.</h2>
                    <div className="space-y-6">
                        <p>Our doctor dashboard provides comprehensive tools to manage your schedule, appointments, and patient interactions efficiently. Set your availability, accept or reject appointments, and track your practice statistics all in one place.</p>
                        <p>
                            <span className="font-bold">Efficient practice management</span> — Manage your schedule with ease, view patient information, track daily appointments, and maintain control over your availability. Spend less time on administrative tasks and more time delivering quality care.
                        </p>
                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="gap-1 pr-1.5">
                            <Link href="/signup">
                                <span>Join as Doctor</span>
                                <ChevronRight className="size-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
