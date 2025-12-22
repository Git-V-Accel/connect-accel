import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { WhatIsSection } from "@/components/home/WhatIsSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { SolutionSection } from "@/components/home/SolutionSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { AudienceSection } from "@/components/home/AudienceSection";
import { DifferentiatorsSection } from "@/components/home/DifferentiatorsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhatIsSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <DifferentiatorsSection />
        <ComparisonSection />
        <UseCasesSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
