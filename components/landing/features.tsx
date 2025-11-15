import { Calendar, Clock, FileText, Shield, Bell, Stethoscope } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-12 md:py-20" id="features">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Everything you need to manage your healthcare</h2>
                    <p>Our comprehensive patient dashboard provides all the tools you need to book appointments, manage your health records, and stay connected with your healthcare providers.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <h3 className="text-sm font-medium">Easy Booking</h3>
                        </div>
                        <p className="text-sm">Book appointments with your preferred doctors in just a few clicks. View available time slots and schedule at your convenience.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <h3 className="text-sm font-medium">Manage Appointments</h3>
                        </div>
                        <p className="text-sm">View, reschedule, or cancel appointments anytime. Keep track of your upcoming and past medical visits.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="size-4" />
                            <h3 className="text-sm font-medium">Medical Records</h3>
                        </div>
                        <p className="text-sm">Access your complete medical history, prescriptions, and test results all in one secure place.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="size-4" />
                            <h3 className="text-sm font-medium">Find Doctors</h3>
                        </div>
                        <p className="text-sm">Search and discover healthcare professionals by specialization. Read profiles and choose the right doctor for you.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Bell className="size-4" />
                            <h3 className="text-sm font-medium">Notifications</h3>
                        </div>
                        <p className="text-sm">Stay informed with real-time updates about your appointments, confirmations, and important health reminders.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            <h3 className="text-sm font-medium">Secure & Private</h3>
                        </div>
                        <p className="text-sm">Your health information is protected with industry-standard security measures and privacy controls.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
