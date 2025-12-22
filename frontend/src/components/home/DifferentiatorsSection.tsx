import { motion } from "framer-motion";
import { Shield, GitBranch, Users, Zap, Lock, Target } from "lucide-react";

const differentiators = [
  {
    icon: Shield,
    title: "Enterprise-Grade Governance",
    description: "Five-layer control architecture ensures accountability at every level—commercial, execution, infrastructure, quality, and financial.",
  },
  {
    icon: GitBranch,
    title: "Centralized Code Ownership",
    description: "All source code lives in V-Accel-controlled repositories. You own the IP, we manage the infrastructure.",
  },
  {
    icon: Users,
    title: "Managed Team, Not Individual Freelancers",
    description: "V-Accel owns delivery accountability. Individual developers don't disappear—the platform ensures continuity.",
  },
  {
    icon: Zap,
    title: "Milestone-Driven Execution",
    description: "Sprint-based delivery with scope locks. No scope creep, no payment ambiguity, no surprises.",
  },
  {
    icon: Lock,
    title: "Escrow-Backed Security",
    description: "Milestone payments held in escrow. Code quality validated before release. Financial security built-in.",
  },
  {
    icon: Target,
    title: "Dedicated Infrastructure",
    description: "Private Git repos, controlled environments, access governance. Your code never touches personal devices.",
  },
];

export function DifferentiatorsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Simplified dark background for performance */}
      <div className="absolute inset-0 bg-dark-pattern" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-dark-dots opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary/80 text-sm font-medium uppercase tracking-wider">Why ConnectAccel</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            Built Different from Day One
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            While others bolt features onto freelancer platforms, we built a governed execution platform from the ground up.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-[#252525] mb-2">{item.title}</h3>
              <p className="text-sm text-[#252525]/80 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

