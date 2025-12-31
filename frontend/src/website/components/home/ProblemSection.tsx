import { motion } from "framer-motion";
import { Users, Code, Building2, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: Users,
    title: "Engineering Hiring Reality",
    points: [
      "Full-time engineering hires take 4-6 months",
      "Wrong hires damage architecture, not just timelines",
      "Bench cost grows faster than output",
      "Idle engineers cost ₹15–25 lakhs per year",
    ],
  },
  {
    icon: Code,
    title: "Freelance Engineering Reality",
    points: [
      " A significant percentage of freelance projects face delivery disruption",
      " Code quality and documentation standards vary widely",
      " Architectural continuity breaks across freelancers",
      " Delivery ownership is fragmented across individuals",
    ],
  },
  {
    icon: Building2,
    title: "Agency Reality",
    points: [
      "Heavy overhead inflates costs",
      "Oversized teams for small scopes",
      "Long contracts with limited flexibility",
      "IP ownership often remains ambiguous during development",
    ],
  },
  {
    icon: ShieldAlert,
    title: "IP & Engineering Risk",
    points: [
      " Code often lives on personal machines",
      " Repository access is difficult to govern",
      "Audit trails are incomplete",
      "IP enforcement is inconsistent",
    ],
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-layered-squares" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-subtle-dots-small opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">The Problem</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            Why Software Freelancing <span className="text-gradient">Breaks at Scale</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-[#252525]">{problem.title}</h3>
              </div>
              <ul className="space-y-3">
                {problem.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Pull Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-2xl md:text-3xl font-semibold text-[#252525] italic">
            "Serious businesses don't want freelance developers. They want{" "}
            <span className="text-gradient">software delivered with accountability</span>."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
