import { motion } from "framer-motion";
import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Code,
  Smartphone,
  Brain
} from "lucide-react";

const pricingTypes = [
  {
    title: "Web Application Development",
    icon: Code,
    projects: [
      {
        size: "Small MVP (2-3 features)",
        timeline: "6-8 weeks",
        price: "₹8-15 lakhs"
      },
      {
        size: "Medium Product (Full-featured app)",
        timeline: "3-5 months",
        price: "₹20-40 lakhs"
      },
      {
        size: "Large Enterprise System",
        timeline: "6-12 months",
        price: "₹50 lakhs - 2 crores"
      }
    ],
    included: [
      "Full-stack development (frontend + backend + database)",
      "QA & testing",
      "DevOps & deployment",
      "90-day warranty",
      "Technical documentation"
    ]
  },
  {
    title: "Mobile Application Development",
    icon: Smartphone,
    projects: [
      {
        size: "Single Platform (iOS or Android)",
        timeline: "10-14 weeks",
        price: "₹10-20 lakhs"
      },
      {
        size: "Cross-Platform (Flutter/React Native)",
        timeline: "12-16 weeks",
        price: "₹15-30 lakhs"
      },
      {
        size: "Native iOS + Android",
        timeline: "4-6 months",
        price: "₹25-50 lakhs"
      }
    ],
    included: [
      "Native or cross-platform development",
      "Backend API development (if needed)",
      "App store submission assistance",
      "QA on multiple devices",
      "90-day warranty"
    ]
  },
  {
    title: "AI/ML Projects",
    icon: Brain,
    projects: [
      {
        size: "PoC / MVP (proof of concept)",
        timeline: "6-10 weeks",
        price: "₹12-25 lakhs"
      },
      {
        size: "Production AI System",
        timeline: "4-6 months",
        price: "₹30-75 lakhs"
      },
      {
        size: "Enterprise AI Platform",
        timeline: "6-12 months",
        price: "₹1-5 crores"
      }
    ],
    included: [
      "Data pipeline development",
      "Model training and optimization",
      "API development for model serving",
      "Monitoring and logging",
      "Documentation for model maintenance"
    ]
  }
];

const integrations = [
  {
    type: "API Integration (CRM, Payment Gateway)",
    timeline: "2-4 weeks",
    price: "₹3-8 lakhs"
  },
  {
    type: "ERP Integration (SAP, Oracle)",
    timeline: "8-16 weeks",
    price: "₹15-40 lakhs"
  },
  {
    type: "Data Migration (Legacy to Modern)",
    timeline: "6-12 weeks",
    price: "₹10-30 lakhs"
  }
];

const costFactors = [
  {
    factor: "Complexity of Business Logic",
    low: "Simple CRUD operations: Lower end of range",
    high: "Complex workflows, calculations, rules engine: Higher end"
  },
  {
    factor: "Third-Party Integrations",
    low: "Base pricing",
    high: "Each integration adds ₹2-5 lakhs depending on complexity"
  },
  {
    factor: "Performance Requirements",
    low: "Standard (hundreds of users): Base pricing",
    high: "High-scale (thousands-millions of users): +20-40%"
  },
  {
    factor: "Security & Compliance",
    low: "Standard security best practices: Included",
    high: "HIPAA, PCI-DSS, SOC 2 compliance: +15-30%"
  },
  {
    factor: "Team Size & Expertise",
    low: "2-3 person team: Lower end",
    high: "5+ person team with specialists: Higher end"
  }
];

const alwaysIncluded = [
  "Project management",
  "Architecture design & documentation",
  "Full-stack development",
  "QA & testing (manual + automated)",
  "DevOps & deployment to cloud",
  "90-day warranty (bug fixes, no new features)",
  "Technical documentation",
  "Code ownership transfer"
];

const optionalAddons = [
  {
    title: "Extended Warranty",
    price: "₹50,000 - 2 lakhs per month",
    description: "Covers bug fixes and minor updates beyond 90 days"
  },
  {
    title: "Ongoing Maintenance SLA",
    price: "₹1-5 lakhs per month",
    description: "Includes: Bug fixes, performance monitoring, security patches, minor feature updates"
  },
  {
    title: "Dedicated Support Team",
    price: "₹3-8 lakhs per month",
    description: "24/7 support, incident response, proactive monitoring"
  }
];

const sampleProject = {
  name: "E-Commerce Platform MVP",
  scope: [
    "Product catalog (100 products)",
    "Shopping cart & checkout",
    "Payment gateway integration (Razorpay)",
    "Order management dashboard",
    "Customer authentication & profiles"
  ],
  timeline: "12 weeks",
  team: "1 Tech Lead + 1 Backend Engineer + 1 Frontend Engineer + 1 QA Engineer",
  price: "₹25 lakhs",
  milestones: [
    { milestone: "Milestone 1 (30%)", amount: "₹7.5 lakhs", deliverable: "Authentication, product catalog, cart (Week 4)" },
    { milestone: "Milestone 2 (40%)", amount: "₹10 lakhs", deliverable: "Checkout, payment integration, order dashboard (Week 8)" },
    { milestone: "Milestone 3 (30%)", amount: "₹7.5 lakhs", deliverable: "QA, deployment, documentation (Week 12)" }
  ]
};

const Pricing = () => {
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Pricing</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                Transparent Project <span className="text-gradient">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Fixed-price projects with clear scope and timelines, or flexible time & materials pricing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Philosophy */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />
          
          <div className="container mx-auto px-6 relative">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8"
              >
                <DollarSign className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-[#252525] mb-4">Fixed-Price Projects (Recommended)</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Clear scope, clear timeline, clear cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>No surprises, no overruns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Milestone-based payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Ideal for: MVPs, defined features, specific modules</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-8"
              >
                <Clock className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-[#252525] mb-4">Time & Materials</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Flexible scope, pay for hours worked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Weekly/bi-weekly invoicing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Full transparency on hours logged</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Ideal for: Ongoing development, R&D projects, evolving requirements</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Price Ranges by Project Type */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Price Ranges</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                By Project Type
              </h2>
            </motion.div>

            <div className="max-w-7xl mx-auto space-y-16">
              {pricingTypes.map((type, typeIndex) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: typeIndex * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#252525]">{type.title}</h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {type.projects.map((project, index) => (
                      <div key={index} className="glass-card rounded-2xl p-6">
                        <div className="font-semibold text-[#252525] mb-4">{project.size}</div>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div>Timeline: {project.timeline}</div>
                          <div className="text-xl font-bold text-primary">{project.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold text-[#252525] mb-4">What's Included:</h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {type.included.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}

              {/* Enterprise Integrations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-8">Enterprise Integrations</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {integrations.map((integration, index) => (
                    <div key={index} className="glass-card rounded-2xl p-6">
                      <div className="font-semibold text-[#252525] mb-4">{integration.type}</div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>Timeline: {integration.timeline}</div>
                        <div className="text-lg font-bold text-primary">{integration.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cost Factors */}
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
                  Factors That Affect Cost
                </h2>
              </div>

              <div className="glass-card rounded-2xl p-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-[#252525]">Factor</th>
                      <th className="text-left py-4 px-4 font-semibold text-[#252525]">Lower End</th>
                      <th className="text-left py-4 px-4 font-semibold text-[#252525]">Higher End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costFactors.map((factor, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-[#252525]">{factor.factor}</td>
                        <td className="py-4 px-4 text-muted-foreground">{factor.low}</td>
                        <td className="py-4 px-4 text-muted-foreground">{factor.high}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Always Included & Optional Addons */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-[#252525] mb-6">What's Always Included</h2>
                <ul className="space-y-3">
                  {alwaysIncluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-[#252525] mb-6">What's Extra (Optional Add-Ons)</h2>
                <div className="space-y-6">
                  {optionalAddons.map((addon, index) => (
                    <div key={index}>
                      <div className="font-semibold text-[#252525] mb-1">{addon.title}</div>
                      <div className="text-primary font-bold mb-2">{addon.price}</div>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sample Project Breakdown */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                  Sample Project Breakdown
                </h2>
              </div>

              <div className="glass-card rounded-2xl p-8 md:p-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#252525] mb-4">Example: {sampleProject.name}</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Timeline:</div>
                      <div className="text-[#252525] font-semibold">{sampleProject.timeline}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Team:</div>
                      <div className="text-[#252525] font-semibold">{sampleProject.team}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Price:</div>
                      <div className="text-primary font-bold text-3xl">{sampleProject.price}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-medium text-muted-foreground mb-3">Scope:</div>
                    <ul className="space-y-2">
                      {sampleProject.scope.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h4 className="font-semibold text-[#252525] mb-4">Milestone Breakdown:</h4>
                  <div className="space-y-4">
                    {sampleProject.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div>
                          <div className="font-medium text-[#252525]">{milestone.milestone}</div>
                          <div className="text-sm text-muted-foreground">{milestone.deliverable}</div>
                        </div>
                        <div className="font-bold text-primary text-lg">{milestone.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
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
                Get a Detailed Quote for Your Project
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a 30-minute technical scoping call. We'll provide a detailed estimate within 48 hours.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Get Quote
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

export default Pricing;

