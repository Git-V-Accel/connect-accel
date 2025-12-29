import { motion } from "framer-motion";
import { DollarSign, Target, Server, Shield, Banknote } from "lucide-react";

const layers = [
  {
    
    icon: DollarSign,
    title: "Commercial Control",
    description: "Pricing, contracts, and margins managed by V-Accel",
  },
  {
   
    icon: Target,
    title: "Execution Control",
    description: "Sprint planning, milestones, scope governance",
  },
  {
   
    icon: Server,
    title: "Infrastructure Control",
    description: "Central repositories, controlled environments, access governance",
  },
  {
    
    icon: Shield,
    title: "Quality Control",
    description: "Code reviews, QA validation, security checks",
  },
  {
 
    icon: Banknote,
    title: "Financial Control",
    description: "Escrow-backed milestones, invoice-driven releases",
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 relative bg-background">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-70" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">The Solution</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            We Convert Software Freelancing Into{" "}
            <span className="text-gradient">Governed Engineering Execution</span>
          </h2>
        </motion.div>

        {/* Five Control Layers */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {layers.map((layer, index) => (
              <motion.div
                key={`layer-${index}-${layer.title}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 flex items-center gap-6 hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <layer.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#252525] mb-1">{layer.title}</h3>
                  <p className="text-muted-foreground text-sm">{layer.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pull Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-2xl md:text-3xl font-semibold text-[#252525] italic">
            "No freelance marketplace governs software delivery at all five levels.{" "}
            <span className="text-gradient">ConnectAccel does</span>."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
