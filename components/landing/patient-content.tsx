import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-32" id="patient-content">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-medium">Take control of your healthcare journey with ease and confidence.</h2>
                    <div className="space-y-6">
                        <p>Our patient dashboard empowers you to manage your health proactively. From booking appointments with trusted doctors to accessing your medical records, everything you need is at your fingertips.</p>
                        <p>
                            <span className="font-bold">Streamlined healthcare management</span> — Book appointments in minutes, reschedule when needed, and keep track of your medical history. Our platform ensures your health information is secure while making healthcare accessible and convenient.
                        </p>
                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="gap-1 pr-1.5">
                            <Link href="/signup">
                                <span>Get Started</span>
                                <ChevronRight className="size-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
