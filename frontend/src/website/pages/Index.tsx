import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { HeroSection } from "@website/components/home/HeroSection";
import { WhatIsSection } from "@website/components/home/WhatIsSection";
import { ProblemSection } from "@website/components/home/ProblemSection";
import { SolutionSection } from "@website/components/home/SolutionSection";
import { HowItWorksSection } from "@website/components/home/HowItWorksSection";
import { ComparisonSection } from "@website/components/home/ComparisonSection";
import { UseCasesSection } from "@website/components/home/UseCasesSection";
import { AudienceSection } from "@website/components/home/AudienceSection";
import { DifferentiatorsSection } from "@website/components/home/DifferentiatorsSection";
import { CTASection } from "@website/components/home/CTASection";

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
