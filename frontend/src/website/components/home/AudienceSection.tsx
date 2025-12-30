import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const builtFor = [
  "Founders building software products",
  "CTOs and Heads of Engineering",
  "Product companies and enterprise IT teams",
  "Agencies needing white-label engineering capacity",
];

const notBuiltFor = [
  "Marketing or design projects",
  "Content or growth freelancing",
  "Operations or virtual assistance",
  "Non-technical freelance work",
];

export function AudienceSection() {
  return (
    <section className="py-24 relative bg-secondary/40">
      {/* Simplified pattern for performance */}
      <div className="absolute inset-0 bg-zigzag opacity-25" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Audience</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
            Who This Is <span className="text-gradient">For</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Built For */}
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
              <h3 className="text-xl font-semibold text-[#252525]">Built For</h3>
            </div>
            <ul className="space-y-4">
              {builtFor.map((item, index) => (
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

          {/* Not Built For */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <X className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-[#252525]">Not Built For</h3>
            </div>
            <ul className="space-y-4">
              {notBuiltFor.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Closing Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-[#252525] font-medium">
            This platform is <span className="text-primary">intentionally narrow</span>. That is its strength.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
