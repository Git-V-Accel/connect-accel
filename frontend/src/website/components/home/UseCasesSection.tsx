import { motion } from "framer-motion";
import { Layers, Rocket, Building, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: Layers,
    title: "Parallel Engineering Execution for CTOs",
    description: "Run multiple software initiatives without expanding full-time engineering headcount. Launch 2-3 projects simultaneously while your core team focuses on product roadmap.",
  },
  {
    icon: Rocket,
    title: "Product Software Development",
    description: "Ship MVPs, platforms, and internal systems without hiring risk. Get to market in 8-12 weeks instead of 6-9 months with traditional hiring.",
  },
  {
    icon: Building,
    title: "Enterprise Module Outsourcing",
    description: "Isolate backend, frontend, QA, or DevOps modules without exposing core systems. Perfect for compliance-sensitive environments.",
  },
  {
    icon: Briefcase,
    title: "Agency White-Label Software Execution",
    description: "Deliver software projects under your brand without revealing freelance developers. Expand capacity without expanding overhead.",
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Perspective depth background with layered gradients */}
      <div className="absolute inset-0 bg-perspective-depth" />
      
      {/* Top fade - creates depth illusion */}
      <div 
        className="absolute top-0 left-0 right-0 h-2/5 opacity-25"
        style={{ 
          background: 'linear-gradient(to bottom, hsl(205 65% 30% / 0.12) 0%, transparent 100%)',
          contain: 'strict',
          transform: 'translateZ(0)'
        }} 
      />
      
      {/* Bottom fade - creates depth illusion */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2/5 opacity-20"
        style={{ 
          background: 'linear-gradient(to top, hsl(175 55% 42% / 0.1) 0%, transparent 100%)',
          contain: 'strict',
          transform: 'translateZ(0)'
        }} 
      />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Use Cases</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            Software Execution <span className="text-gradient">Use Cases</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all group hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <useCase.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-[#252525] mb-4">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
