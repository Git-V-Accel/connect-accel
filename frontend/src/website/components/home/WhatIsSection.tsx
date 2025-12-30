import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const isItems = [
  "A managed software engineering execution layer",
  "Built for application development, platforms, and enterprise systems",
  "Designed for founders, CTOs, and engineering leaders",
  "Governed, milestone-driven delivery with accountability",
];


const isNotItems = [
  "Not a freelance marketplace",
  "Not a talent directory",
  "Not a job portal",
  "Not for design-only, marketing, content, operations, or non-technical work",
];

export function WhatIsSection() {
  return (
    <section className="py-24 relative bg-secondary/40">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-checkerboard opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
            What ConnectAccel <span className="text-gradient">IS</span> / <span className="text-muted-foreground">IS NOT</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* What It IS */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-[#252525]">What ConnectAccel IS</h3>
            </div>
            <ul className="space-y-4">
              {isItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* What It IS NOT */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-[#252525]">What ConnectAccel IS NOT</h3>
            </div>
            <ul className="space-y-4">
              {isNotItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-destructive/70 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Critical Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 border-l-4 border-primary">
            <p className="text-[#252525] font-medium text-center">
              If your requirement is not software development or engineering execution, 
              ConnectAccel is <span className="text-primary">intentionally not built for it</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
