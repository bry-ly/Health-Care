import HeroSection from "@/components/landing/hero-section";
import Features from "@/components/landing/features";
import PatientContent from "@/components/landing/patient-content";

import Footer from "@/components/landing/footer";
export default function Home() {
  return (
    <main>
      <HeroSection />
      <Features />
      <PatientContent />

      <Footer />
    </main>
  );
}
