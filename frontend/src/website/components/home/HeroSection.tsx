import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Clean modern background */}
      <div className="absolute inset-0 bg-hero-clean" />

      <div className="container mx-auto px-6 relative z-10 -mt-32 md:-mt-40 lg:-mt-48">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-7 space-y-3"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#252525] leading-[1.3]">
              Enterprise Software Execution
            </h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.3]">
              <span className="text-gradient">Without Freelance Risk</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-[1.8]"
          >
           ConnectAccel is a managed software execution platform where <b>V-Accel owns engineering delivery, source code governance, infrastructure, and accountability</b> — not individual developers.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <Button size="lg" className="px-7 py-5 h-auto" asChild>
              <Link to="/contact" className="group">
                Talk to the Software Execution Team
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-7 py-5 h-auto" asChild>
              <Link to="/how-it-works" className="group">
                <Play className="mr-2 h-4 w-4" />
                See How It Works
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
