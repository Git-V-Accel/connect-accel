import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Simplified dark background for performance */}
      <div className="absolute inset-0 bg-dark-dots" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-dark-pattern opacity-50" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Discuss Your Software{" "}
            <span className="text-gradient">Execution Gap</span>
          </h2>
          <p className="text-lg text-white/80 mb-10">
            One conversation. No sales theatre.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact" className="group">
              Schedule Technical Scoping Call
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
