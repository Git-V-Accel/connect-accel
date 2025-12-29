import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  DollarSign,
  FileCheck,
  Lock,
  Code,
  CheckCircle,
  Presentation,
  CreditCard,
  Archive,
  ArrowDown
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Client submits software requirement",
  },
  {
    step: "02",
    icon: Search,
    title: "Technical intake or discovery call within 24 hours",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Scope validation and feasibility assessment",
  },
  {
    step: "04",
    icon: Lock,
    title: "Engineers are sourced privately by V-Accel",
  },
  {
    step: "05",
    icon: DollarSign,
    title: "Internal cost and timeline structuring",
  },
  {
    step: "06",
    icon: FileCheck,
    title: "NDA, MSA, and SOW execution",
  },
  {
    step: "07",
    icon: CreditCard,
    title: "Escrow-backed milestone structure",
  },
  {
    step: "08",
    icon: Code,
    title: "Engineering execution within V-Accel infrastructure",
  },
  {
    step: "09",
    icon: Search,
    title: "Internal QA and code review",
  },
  {
    step: "10",
    icon: Presentation,
    title: "Client demos led by V-Accel",
  },
  {
    step: "11",
    icon: FileCheck,
    title: "Milestone approval and payment release",
  },
  {
    step: "12",
    icon: Archive,
    title: "Code transfer and access revocation",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#fafafa]">
      {/* Subtle brand patterns */}
      <div className="absolute inset-0 bg-threads-svg opacity-[0.03]" />
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
            PROCESS
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#252525]">
            How It <span className="text-gradient">Works</span>
          </h2>
        </motion.div>

        {/* Steps Vertical Flow */}
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              {/* Step Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="w-full bg-white rounded-2xl p-6 border border-[#f0f0f0] shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/[0.03] flex items-center justify-center border border-primary/5 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-primary/40 block mb-1 uppercase tracking-wider">
                    Step {step.step}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-[#252525] group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                </div>
              </motion.div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="py-2 flex justify-center">
                  <ArrowDown className="w-5 h-5 text-primary/30" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Governance Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <div className="relative group max-w-3xl w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl py-8 px-12 border border-primary/10 shadow-xl text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-110" />

              <p className="text-[#252525] text-lg md:text-xl font-bold leading-relaxed relative z-10">
                Clients <span className="text-primary tracking-wide">do not manage</span> individual developers.<br />
                Engineers <span className="text-primary tracking-wide">do not retain</span> ownership of source code.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
