import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { AIMagic } from "@/components/landing/AIMagic";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PhotoExperience } from "@/components/landing/PhotoExperience";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <AIMagic />
        <HowItWorks />
        <PhotoExperience />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
