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
  Archive 
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Client submits software requirement",
    description: "Technical intake form (10 minutes) or schedule a scoping call",
  },
  {
    step: "02",
    icon: Search,
    title: "V-Accel validates scope and engineering feasibility",
    description: "30-minute technical discovery call within 24 hours",
  },
  {
    step: "03",
    icon: DollarSign,
    title: "Software engineers are sourced privately",
    description: "Internal resource allocation based on skills and availability (no public bidding)",
  },
  {
    step: "04",
    icon: FileCheck,
    title: "NDA, IP ownership, and vendor agreements executed",
    description: "Master Service Agreement (MSA) + Statement of Work (SOW)",
  },
  {
    step: "05",
    icon: Lock,
    title: "Milestone-based escrow structure created",
    description: "Payment security for predictable delivery",
  },
  {
    step: "06",
    icon: Code,
    title: "Engineering execution inside V-Accel infrastructure",
    description: "Private Git repositories, dedicated environments, access governance",
  },
  {
    step: "07",
    icon: CheckCircle,
    title: "Internal code review and QA",
    description: "Peer review, automated testing, security scanning",
  },
  {
    step: "08",
    icon: Presentation,
    title: "Client demos conducted by V-Accel",
    description: "Weekly sprint reviews and milestone presentations",
  },
  {
    step: "09",
    icon: CreditCard,
    title: "Milestone payment release",
    description: "Client approval triggers payment from escrow",
  },
  {
    step: "10",
    icon: Archive,
    title: "Code archived and access revoked",
    description: "Source code transferred to client repository, engineer access terminated",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-secondary/30">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-organic-blobs" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-6 relative group hover:border-primary/50 transition-all"
            >
              <span className="text-4xl font-bold text-primary/20 absolute top-4 right-4">
                {step.step}
              </span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-[#252525] mb-2 pr-8">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Explicit Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 border-l-4 border-primary">
            <p className="text-[#252525] font-medium text-center">
              Clients <span className="text-primary">never</span> interact directly with software freelancers. 
              Developers <span className="text-primary">never</span> own the code.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
