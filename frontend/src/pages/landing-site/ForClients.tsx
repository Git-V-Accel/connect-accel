import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Shield,
  Users,
  ArrowRight,
  TrendingUp,
  Building,
  Briefcase,
  Rocket
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Predictable Software Delivery",
    description: "Fixed milestones with clear acceptance criteria. Weekly progress updates and sprint demos. On-time delivery or credits applied (10% per week delay)."
  },
  {
    icon: Users,
    title: "Zero Freelancer Management",
    description: "No sourcing, no interviewing, no onboarding. No direct communication with engineers. V-Accel handles all project management."
  },
  {
    icon: Shield,
    title: "IP-Safe Execution",
    description: "All code developed in secure V-Accel infrastructure. Complete IP transfer upon final payment. No risk of code reuse or leakage."
  },
  {
    icon: CheckCircle,
    title: "Enterprise-Grade Governance",
    description: "Code reviews on every pull request. Automated security scanning (SAST/DAST). Comprehensive test coverage (>80% target). Architecture review at milestone gates."
  }
];

const idealFor = [
  {
    title: "Funded Startups (Seed to Series B)",
    icon: Rocket,
    need: "Augment engineering team without full-time hiring",
    budget: "₹10-50 lakhs per project",
    pain: "Hiring is slow, expensive, risky",
    example: "You're a Series A SaaS startup with a 5-person engineering team. You need to build a customer analytics dashboard while your core team focuses on the product roadmap. ConnectAccel delivers the dashboard in 10 weeks with a dedicated team, code review, and QA—all under one contract."
  },
  {
    title: "CTOs & Engineering Leaders",
    icon: Building,
    need: "Run multiple initiatives in parallel",
    budget: "₹20 lakhs - 1 crore per year",
    pain: "Limited bandwidth, can't hire fast enough",
    example: "You're a CTO at a 50-person company with 3 product initiatives and 1 internal tool project. Your team is maxed out. ConnectAccel lets you launch 2 additional projects simultaneously without expanding headcount."
  },
  {
    title: "Agencies & Systems Integrators",
    icon: Briefcase,
    need: "White-label software development capacity",
    budget: "₹20 lakhs - 1 crore per project",
    pain: "High bench cost, margin pressure",
    example: "You're an agency that just won a large enterprise client project but don't have the backend engineering capacity. ConnectAccel delivers under your brand with your project manager coordinating—client never knows we exist."
  }
];

const comparison = [
  {
    dimension: "Team Size",
    traditional: "5-10 people for simple projects",
    connectaccel: "2-4 people (optimized team)"
  },
  {
    dimension: "Cost",
    traditional: "2-3x engineer rates (heavy overhead)",
    connectaccel: "1.4-1.6x engineer rates"
  },
  {
    dimension: "Contract Length",
    traditional: "6-12 months minimum",
    connectaccel: "Project-based, as short as 8 weeks"
  },
  {
    dimension: "Flexibility",
    traditional: "Locked into long contracts",
    connectaccel: "Scale up/down per milestone"
  },
  {
    dimension: "Code Ownership",
    traditional: "Agency owns during development",
    connectaccel: "V-Accel owns, you get full IP"
  },
  {
    dimension: "Quality Control",
    traditional: "Variable (depends on agency)",
    connectaccel: "Standardized (V-Accel process)"
  }
];

const timeline = [
  { week: "Week 1", activity: "Technical Scoping → Proposal" },
  { week: "Week 2", activity: "Contract + Escrow → Team Assembly" },
  { week: "Week 3-12", activity: "Sprint Execution (weekly demos)" },
  { week: "Week 13", activity: "Final Delivery + Warranty Begins" }
];

const testimonials = [
  {
    quote: "V-Accel delivered our fintech lending platform in 16 weeks when other vendors quoted 8-10 months. The code quality was enterprise-grade, and they understood compliance requirements better than most agencies.",
    author: "VP Engineering, Series B Fintech Startup",
    note: "Name withheld"
  },
  {
    quote: "We've been using ConnectAccel for overflow engineering capacity for the past year. They've delivered 4 projects flawlessly—on time, on budget, with zero drama.",
    author: "CTO, SaaS Company",
    note: "100+ employees"
  },
  {
    quote: "As an agency, ConnectAccel is our secret weapon. We can take on larger projects without hiring, and our clients never know we're using a white-label partner.",
    author: "Founder, Digital Agency"
  }
];

const ForClients = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-clean" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">For Clients</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                One Software Contract.{" "}
                <span className="text-gradient">One Accountable Owner.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enterprise software delivery without freelance risk. Fixed milestones, escrow protection, and quality assurance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">What You Get</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Four Core Benefits
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#252525] mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Ideal For */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Ideal For</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Who This Works Best For
              </h2>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
              {idealFor.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-[#252525] mb-4">{item.title}</h3>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Need:</div>
                          <div className="text-[#252525]">{item.need}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Budget:</div>
                          <div className="text-[#252525]">{item.budget}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Pain:</div>
                          <div className="text-[#252525]">{item.pain}</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Example Scenario:</div>
                        <p className="text-[#252525] leading-relaxed">{item.example}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-mesh-gradient opacity-15" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                  How It's Different from Hiring an Agency
                </h2>
              </div>

              <div className="glass-card rounded-2xl p-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-[#252525]">Dimension</th>
                      <th className="text-left py-4 px-4 font-semibold text-[#252525]">Traditional Agency</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary">ConnectAccel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-[#252525]">{row.dimension}</td>
                        <td className="py-4 px-4 text-muted-foreground">{row.traditional}</td>
                        <td className="py-4 px-4 text-[#252525] font-medium">{row.connectaccel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                  Typical Project Timeline
                </h2>
                <p className="text-muted-foreground">
                  Average Project Duration: 8-16 weeks | Minimum Project Size: ₹5 lakhs | Average Project Size: ₹15-30 lakhs
                </p>
              </div>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-xl p-6 flex items-center gap-6"
                  >
                    <div className="w-20 flex-shrink-0 text-sm font-semibold text-primary">{item.week}</div>
                    <div className="flex-1 text-[#252525]">{item.activity}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Client Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                What Our Clients Say
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <p className="text-[#252525] leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                  <div className="pt-4 border-t border-border/50">
                    <div className="font-semibold text-[#252525]">{testimonial.author}</div>
                    {testimonial.note && (
                      <div className="text-sm text-muted-foreground mt-1">{testimonial.note}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-mesh-gradient opacity-15" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                Start with a 30-Minute Technical Scoping Call
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                No commitment. No sales pressure. Just an honest assessment of whether we can help.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Schedule Call
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForClients;

