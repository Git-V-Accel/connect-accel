import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  FileText,
  Users,
  Scale,
  FileCheck,
  Lock,
  Code,
  CheckCircle,
  Archive,
  ArrowRight,
  Clock,
  Shield,
  GitBranch,
  TestTube,
  FileCode,
  ArrowDown
} from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Software Requirement Intake",
    duration: "10-30 minutes",
    icon: FileText,
    process: [
      "Structured technical scoping form or call",
      "Feasibility assessment by V-Accel technical team",
      "Architecture considerations and technology recommendations",
      "Initial timeline and budget range estimation",
    ],
    deliverable: "Preliminary feasibility report with high-level approach",
  },
  {
    phase: "Phase 2",
    title: "Private Engineering Sourcing",
    duration: "24-48 hours",
    icon: Users,
    process: [
      "Internal resource allocation based on technical requirements",
      "Only vetted backend, frontend, QA, DevOps, and AI engineers considered",
      "Team composition determined: Tech Lead + Engineers + QA (based on project size)",
      "No public bidding—engineers are assigned internally",
    ],
    deliverable: "Internal team composition document (not shared with client)",
  },
  {
    phase: "Phase 3",
    title: "Dual-Side Engineering Negotiation",
    duration: "2-3 business days",
    icon: Scale,
    process: [
      "Cost optimization with engineers (V-Accel negotiates engineer rates)",
      "Value positioning with client (proposal with fixed price or T&M rates)",
      "Margins are engineered into the structure, not exposed to either party",
      "Client receives comprehensive proposal",
    ],
    deliverable: "Client Proposal: Scope, timeline, cost breakdown, milestone structure",
  },
  {
    phase: "Phase 4",
    title: "Legal & IP Enforcement",
    duration: "1-2 business days",
    icon: FileCheck,
    process: [
      "Non-Disclosure Agreement (NDA) signed by all parties",
      "Vendor Agreement between client and V-Accel (MSA + SOW)",
      "Engineer Service Agreement (V-Accel with engineers)",
      "Source code IP transfer clauses clearly defined",
    ],
    deliverable: "Executed contracts with all parties",
  },
  {
    phase: "Phase 5",
    title: "Escrow Lock",
    duration: "Same day as contract execution",
    icon: Lock,
    process: [
      "Milestone-wise payment commitment before execution begins",
      "Typical structure: 20-30% upfront, 30-50% per milestone, 20% final",
      "Funds held in V-Accel escrow account (or third-party escrow service)",
      "Payment released only upon milestone approval",
    ],
    deliverable: "Escrow confirmation and payment schedule",
  },
  {
    phase: "Phase 6",
    title: "Controlled Engineering Execution",
    duration: "Project-dependent (typically 2-6 months)",
    icon: Code,
    process: [
      "V-Accel-owned Git repositories (GitHub Enterprise / GitLab)",
      "Controlled cloud environments (AWS/Azure/GCP with proper governance)",
      "Logged access with MFA requirement for all engineers",
      "Sprint-based execution with weekly standups and demos",
      "Engineers never have direct client communication—all via V-Accel PM",
    ],
    deliverable: "Working software at each milestone",
  },
  {
    phase: "Phase 7",
    title: "Quality Gate",
    frequency: "Every milestone delivery",
    icon: Shield,
    process: [
      "Code reviews: Peer review for all pull requests",
      "QA testing: Manual + automated testing against acceptance criteria",
      "Security checks: SAST/DAST scanning, dependency vulnerability checks",
      "Performance validation: Load testing for critical paths",
      "Documentation review: Code comments, API docs, deployment guides",
    ],
    deliverable: "QA sign-off report per milestone",
  },
  {
    phase: "Phase 8",
    title: "Closure",
    duration: "1-2 business days after final approval",
    icon: Archive,
    process: [
      "Final delivery to client-specified repository",
      "Engineer access revocation from all systems",
      "Code archiving in V-Accel secure storage (for audit/reference)",
      "90-day warranty period begins",
      "Final payment released to engineers after client sign-off",
    ],
    deliverable: "Complete source code transfer, Technical documentation, Deployment guides, Warranty SLA",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-clean" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Execution Process</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                How ConnectAccel Executes{" "}
                <span className="text-gradient">Software Projects</span>
              </h1>
             
            </motion.div>
          </div>
        </section>

        {/* Execution Philosophy */}
        <section className="py-16 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-4">
                  Execution Philosophy
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We do not connect clients to software developers. We absorb software development into an enterprise delivery model.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Detailed Execution Phases */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Detailed Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Execution Phases
              </h2>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
              {phases.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon and Phase Number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-0">
                        <phase.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="md:hidden">
                        <div className="text-sm font-semibold text-primary mb-1">{phase.phase}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {phase.duration || phase.frequency}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="hidden md:flex items-center gap-4 mb-4">
                        <span className="text-sm font-semibold text-primary">{phase.phase}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {phase.duration || phase.frequency}
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-semibold text-[#252525] mb-4">
                        {phase.title}
                      </h3>

                      {/* Process Steps */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Process:</h4>
                        <ul className="space-y-2">
                          {phase.process.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-[#252525]">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deliverable */}
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Deliverable:</h4>
                        <p className="text-[#252525] font-medium">{phase.deliverable}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Visual Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 max-w-5xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-[#252525] mb-8 text-center">Visual Timeline</h3>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#252525]">Inquiry</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">24-48h: Scoping</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">2-3d: Proposal</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">1-2d: Legal</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Escrow</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">2-6mo: Execution</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">QA Gates</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-[#252525]">Final Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-mesh-gradient opacity-15" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get a detailed proposal within 48 hours. No commitment required.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Schedule Technical Scoping Call
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
