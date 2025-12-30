import { motion } from "framer-motion";
import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Code, 
  Shield, 
  Users, 
  ArrowRight,
  Lock,
  DollarSign,
  Briefcase,
  XCircle
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Guaranteed Milestone Payments",
    description: "Payment is locked in escrow before work begins. Milestone-based releases (no 30-60 day NET terms). V-Accel pays you within 7 days of milestone approval."
  },
  {
    icon: Code,
    title: "Clear Technical Scope",
    description: "No scope creep—milestones are contractually locked. Technical specs provided upfront. Architecture decisions made collaboratively."
  },
  {
    icon: Briefcase,
    title: "Enterprise Software Exposure",
    description: "Work on production systems for funded startups and enterprises. Modern tech stacks: React, Node.js, Python, AWS, Docker, Kubernetes. Real-world problems: scalability, security, performance."
  },
  {
    icon: Users,
    title: "No Sales, No Negotiation",
    description: "V-Accel handles all client communication. You focus 100% on engineering. No invoicing, no chasing payments, no client management."
  }
];

const engineerTypes = [
  {
    title: "Backend Engineers",
    tech: "Node.js, Python, Java, Go, .NET Core",
    databases: "PostgreSQL, MySQL, MongoDB, Redis",
    apis: "REST APIs, GraphQL, gRPC, microservices"
  },
  {
    title: "Frontend Engineers",
    tech: "React, Vue.js, Angular, Next.js",
    languages: "TypeScript, modern CSS frameworks",
    skills: "Responsive design, performance optimization"
  },
  {
    title: "QA / Test Engineers",
    testing: "Manual testing, automated testing (Selenium, Cypress, Jest)",
    api: "API testing (Postman, REST Assured)",
    cicd: "CI/CD integration (GitHub Actions, GitLab CI)"
  },
  {
    title: "DevOps Engineers",
    cloud: "AWS, Azure, Google Cloud",
    containers: "Docker, Kubernetes, Terraform",
    tools: "CI/CD pipelines, monitoring (Prometheus, Grafana)"
  },
  {
    title: "AI / ML Engineers",
    frameworks: "TensorFlow, PyTorch, scikit-learn",
    domains: "NLP, computer vision, recommendation systems",
    deployment: "Model deployment and MLOps"
  }
];

const excludedRoles = [
  "Designers (UI/UX, graphic design)",
  "Marketers (SEO, content, social media)",
  "Operations (virtual assistants, data entry)",
  "Any non-engineering roles"
];

const processSteps = [
  {
    step: "Step 1",
    title: "Application + Vetting",
    details: [
      "Submit application with resume + GitHub/portfolio",
      "Technical assessment (coding challenge + system design)",
      "Live coding interview (90 minutes)",
      "Background + reference checks"
    ],
    note: "Acceptance Rate: ~3% of applicants"
  },
  {
    step: "Step 2",
    title: "Project Assignment",
    details: [
      "V-Accel assigns you to projects based on your skills and availability",
      "You receive: Technical spec, milestone breakdown, timeline, payment schedule",
      "No bidding, no negotiation—projects come to you"
    ]
  },
  {
    step: "Step 3",
    title: "Execution in V-Accel Infrastructure",
    details: [
      "Access to V-Accel Git repositories (GitHub/GitLab)",
      "Dedicated dev environment provisioned",
      "Weekly standups with V-Accel PM (not client)",
      "Code review feedback from senior engineers"
    ]
  },
  {
    step: "Step 4",
    title: "Milestone Delivery + Payment",
    details: [
      "Submit work for internal QA review",
      "V-Accel validates against acceptance criteria",
      "Client demos conducted by V-Accel (you don't present)",
      "Payment released from escrow within 7 days of approval"
    ]
  }
];

const paymentExample = {
  project: "Backend API Development",
  duration: "8 weeks",
  budget: "₹8 lakhs",
  rate: "₹2,500/hr",
  hours: "320 hours",
  earnings: "₹8 lakhs (100% of project budget)",
  milestones: [
    { milestone: "Milestone 1 (30%)", amount: "₹2.4 lakhs", when: "after Week 3" },
    { milestone: "Milestone 2 (40%)", amount: "₹3.2 lakhs", when: "after Week 6" },
    { milestone: "Milestone 3 (30%)", amount: "₹2.4 lakhs", when: "after Week 8 (final delivery)" }
  ]
};

const testimonials = [
  {
    quote: "I've been working with ConnectAccel for 8 months. No client drama, no payment chasing, just good projects and timely payments. Wish I'd found them earlier.",
    author: "Senior Backend Engineer",
    tech: "Node.js"
  },
  {
    quote: "The vetting process was tough, but once I got in, projects have been consistent. I'm averaging ₹4-5 lakhs per month working 40 hours/week.",
    author: "Full-Stack Engineer",
    tech: "MERN Stack"
  }
];

const ForEngineers = () => {
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">For Engineers</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                Execute Software.{" "}
                <span className="text-gradient">Don't Chase Clients.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join ConnectAccel's elite engineering network. Guaranteed payments, enterprise projects, no client chasing.
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

        {/* Who We Onboard */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Who We Onboard</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Engineering Specializations
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {engineerTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-[#252525] mb-4">{type.title}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {type.tech && <li>• {type.tech}</li>}
                    {type.databases && <li>• {type.databases}</li>}
                    {type.apis && <li>• {type.apis}</li>}
                    {type.languages && <li>• {type.languages}</li>}
                    {type.skills && <li>• {type.skills}</li>}
                    {type.testing && <li>• {type.testing}</li>}
                    {type.api && <li>• {type.api}</li>}
                    {type.cicd && <li>• {type.cicd}</li>}
                    {type.cloud && <li>• {type.cloud}</li>}
                    {type.containers && <li>• {type.containers}</li>}
                    {type.tools && <li>• {type.tools}</li>}
                    {type.frameworks && <li>• {type.frameworks}</li>}
                    {type.domains && <li>• {type.domains}</li>}
                    {type.deployment && <li>• {type.deployment}</li>}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Explicit Exclusion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 border-2 border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-destructive" />
                  <h3 className="text-xl font-semibold text-[#252525]">Explicit Exclusion</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Non-technical freelancers are not onboarded. This includes:
                </p>
                <ul className="space-y-2">
                  {excludedRoles.map((role, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      <span className="text-[#252525]">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-mesh-gradient opacity-15" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                For Engineers
              </h2>
            </motion.div>

            <div className="max-w-5xl mx-auto space-y-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xl">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm font-semibold text-primary">{step.step}</span>
                        <h3 className="text-xl font-semibold text-[#252525]">{step.title}</h3>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                      {step.note && (
                        <p className="text-sm font-medium text-primary mt-4">{step.note}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Structure Example */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-8 text-center">
                  Payment Structure (Example)
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Project:</div>
                    <div className="text-[#252525] font-semibold">{paymentExample.project}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Duration:</div>
                    <div className="text-[#252525] font-semibold">{paymentExample.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Budget:</div>
                    <div className="text-[#252525] font-semibold">{paymentExample.budget}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Your Rate:</div>
                    <div className="text-[#252525] font-semibold">{paymentExample.rate}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Hours:</div>
                    <div className="text-[#252525] font-semibold">{paymentExample.hours}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Your Earnings:</div>
                    <div className="text-primary font-bold text-lg">{paymentExample.earnings}</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h3 className="font-semibold text-[#252525] mb-4">Payment Schedule:</h3>
                  <div className="space-y-3">
                    {paymentExample.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div>
                          <div className="font-medium text-[#252525]">{milestone.milestone}</div>
                          <div className="text-sm text-muted-foreground">{milestone.when}</div>
                        </div>
                        <div className="font-bold text-primary">{milestone.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Engineer Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                What Engineers Say
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                    <div className="text-sm text-muted-foreground mt-1">{testimonial.tech}</div>
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
                Apply to Join ConnectAccel's Engineering Network
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vetting process takes 1-2 weeks. If accepted, first project assignment within 30 days.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Apply Now
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

export default ForEngineers;

