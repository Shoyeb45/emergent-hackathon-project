import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { ForHostsGuests } from "@/components/landing/ForHostsGuests";
import { AIMagic } from "@/components/landing/AIMagic";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EventsSection } from "@/components/landing/EventsSection";
import { PhotoExperience } from "@/components/landing/PhotoExperience";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <ForHostsGuests />
        <AIMagic />
        <HowItWorks />
        <EventsSection />
        <PhotoExperience />
        <FeaturesGrid />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
