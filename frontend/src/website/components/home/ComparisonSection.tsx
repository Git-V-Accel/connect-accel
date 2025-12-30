import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";

const comparisonData = [
  {
    dimension: "Software Delivery Ownership",
    marketplace: { status: "bad", text: "None" },
    agency: { status: "partial", text: "Partial" },
    connectaccel: { status: "good", text: "Complete" },
  },
  {
    dimension: "Source Code Control",
    marketplace: { status: "bad", text: "No" },
    agency: { status: "partial", text: "Variable" },
    connectaccel: { status: "good", text: "Full Control" },
  },
  {
    dimension: "Engineering Governance",
    marketplace: { status: "bad", text: "Self-serve" },
    agency: { status: "partial", text: "Depends" },
    connectaccel: { status: "good", text: "Comprehensive" },
  },
  {
    dimension: "Freelancer–Client Exposure",
    marketplace: { status: "bad", text: "Full Direct" },
    agency: { status: "partial", text: "Partial" },
    connectaccel: { status: "good", text: "None—Fully Managed" },
  },
  {
    dimension: "Cost Efficiency",
    marketplace: { status: "good", text: "Low fees" },
    agency: { status: "bad", text: "High markup" },
    connectaccel: { status: "good", text: "Optimized" },
  },
  {
    dimension: "Accountability",
    marketplace: { status: "bad", text: "Individual" },
    agency: { status: "partial", text: "Variable" },
    connectaccel: { status: "good", text: "V-Accel Owned" },
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "good") {
    return <Check className="w-5 h-5 text-emerald-500" />;
  } else if (status === "partial") {
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
  return <X className="w-5 h-5 text-destructive" />;
}

export function ComparisonSection() {
  return (
    <section className="py-24 relative bg-background">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-pixel-grid opacity-60" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Comparison</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            Why Not Software <span className="text-gradient">Freelance Marketplaces</span>
          </h2>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto overflow-x-auto"
        >
          <div className="glass-card rounded-2xl overflow-hidden min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-primary/5 border-b border-border/30">
              <div className="text-sm font-semibold text-[#252525]">Dimension</div>
              <div className="text-sm font-semibold text-center text-muted-foreground">Marketplaces<br /><span className="text-xs font-normal">(Upwork/Fiverr)</span></div>
              <div className="text-sm font-semibold text-center text-muted-foreground">Agencies</div>
              <div className="text-sm font-semibold text-center text-primary">ConnectAccel</div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, index) => (
              <motion.div
                key={row.dimension}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-4 gap-4 p-6 border-b border-border/30 last:border-b-0 hover:bg-primary/5 transition-colors"
              >
                <div className="text-sm text-[#252525] font-medium">{row.dimension}</div>
                <div className="flex items-center justify-center gap-2">
                  <StatusIcon status={row.marketplace.status} />
                  <span className="text-sm text-muted-foreground">{row.marketplace.text}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <StatusIcon status={row.agency.status} />
                  <span className="text-sm text-muted-foreground">{row.agency.text}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <StatusIcon status={row.connectaccel.status} />
                  <span className="text-sm text-[#252525] font-medium">{row.connectaccel.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pull Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-2xl md:text-3xl font-semibold text-[#252525] italic">
            "Cheap code is easy to buy.{" "}
            <span className="text-gradient">Controlled software delivery is not</span>."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
