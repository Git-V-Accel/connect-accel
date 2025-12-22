import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Building,
  Users,
  Award,
  Target,
  Heart,
  TrendingUp,
  Network,
  Rocket,
  Shield,
  Scale,
  GraduationCap,
  Globe
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Execution Over Promises",
    description: "We under-promise and over-deliver. Timelines are commitments, not aspirations."
  },
  {
    icon: TrendingUp,
    title: "Transparency",
    description: "Clients get full visibility into progress, blockers, and decisions. No surprises."
  },
  {
    icon: Award,
    title: "Quality First",
    description: "We don't ship code until it passes code review, QA, and security scans. Period."
  },
  {
    icon: Building,
    title: "Long-Term Thinking",
    description: "We build relationships, not transactions. 45% of our clients return for additional projects."
  },
  {
    icon: Heart,
    title: "Continuous Learning",
    description: "Our team invests 10% of time in learning new technologies and improving processes."
  }
];

const companyInfo = {
  founded: "2020",
  headquarters: "Chennai, Tamil Nadu, India",
  teamSize: "40+ employees",
  revenue: "₹10 crore (FY 2024-25)",
  projectsDelivered: "150+ (as of December 2025)"
};

const divisions = [
  {
    name: "ConnectAccel",
    description: "Managed software development execution platform for enterprise clients. We absorb software projects into a governed delivery model.",
    isCurrent: true
  },
  {
    name: "Axess Technology",
    description: "IT training institute located inside Tidel Park Chennai. We train software engineers in full-stack development, testing, DevOps, and AI—and place them in top IT companies.",
    programs: [
      "MERN Stack (MongoDB, Express, React, Node.js)",
      "MEAN Stack (MongoDB, Express, Angular, Node.js)",
      "Python Full-Stack (Django/Flask)",
      "Java Full-Stack (Spring Boot)",
      "DevOps & Cloud (AWS, Docker, Kubernetes)",
      "AI & Machine Learning (Python, TensorFlow, NLP)"
    ],
    placement: {
      studentsPlaced: "1,500+",
      partnerCompanies: "800+",
      placementRate: "95%+"
    }
  },
  {
    name: "V-Accel AI Dynamics (Core Software Services)",
    description: "Custom software development for enterprise clients. We build web applications, mobile apps, AI/ML systems, and cloud infrastructure.",
    isCurrent: true
  }
];

const differentiators = [
  {
    icon: Network,
    title: "Integrated Talent Pipeline",
    description: "Our training institute (Axess Technology) feeds into our software services. We train engineers, vet them in real projects, and the top performers join ConnectAccel's engineering network."
  },
  {
    icon: Rocket,
    title: "Delivery-First Culture",
    description: "We don't just write code—we deliver working software. Our process emphasizes code review, QA, documentation, and hand-off."
  },
  {
    icon: Shield,
    title: "Infrastructure Ownership",
    description: "We invest in enterprise-grade infrastructure (GitHub Enterprise, AWS Organization accounts, monitoring tools) so our clients don't have to."
  },
  {
    icon: Scale,
    title: "Legal & Compliance Rigor",
    description: "Proper contracts, IP transfer clauses, escrow structures, and audit trails. We operate like an enterprise, not a freelance shop."
  }
];

const recognition = [
  { title: "ISO 9001:2015", description: "Quality Management (Certified)" },
  { title: "SOC 2 Type II", description: "Information Security (In Progress)" },
  { title: "Top 100 IT Training Institutes", description: "Times of India (2024)" },
  { title: "Best Software Development Partner", description: "TechCircle Awards (Finalist 2024)" }
];

const clientsByIndustry = [
  { industry: "FinTech", percentage: "25%", projects: "lending platforms, payment systems, neobanks" },
  { industry: "HealthTech", percentage: "20%", projects: "telemedicine, EHR, patient portals" },
  { industry: "E-Commerce", percentage: "18%", projects: "marketplaces, inventory management, seller tools" },
  { industry: "SaaS", percentage: "22%", projects: "B2B platforms, analytics dashboards, customer portals" },
  { industry: "Enterprise IT", percentage: "15%", projects: "internal tools, workflow automation, integrations" }
];

const socialImpact = [
  {
    icon: Users,
    title: "Women in Tech Initiative",
    description: "30% of our Axess Technology students are women. Scholarship program for women from underrepresented backgrounds. Target: 40% women engineers by 2026.",
    stats: [
      { label: "Current", value: "30%" },
      { label: "Target 2026", value: "40%" }
    ]
  },
  {
    icon: Globe,
    title: "Rural Talent Development",
    description: "Partnerships with colleges in Tier 2/3 cities. Remote training programs for students without access to Tidel Park. Placement support for students relocating to Chennai/Bangalore.",
    stats: [
      { label: "Partner Colleges", value: "50+" },
      { label: "Rural Students Trained", value: "800+" }
    ]
  }
];

const leadership = [
  {
    name: "Venkatesan J",
    role: "Founder & CEO",
    bio: "10+ years in software development and IT services. Previously led engineering teams. B.Tech in Computer Science. Expert in React.js, Node.js, AI integrations. Vision: Build India's most trusted software execution platform."
  }
];

const contactInfo = {
  company: "V-Accel AI Dynamics Private Limited",
  address: "Tidel Park, Taramani, Chennai, Tamil Nadu 600113, India",
  email: "info@v-accel.ai",
  phone: "+91 [Number]",
  website: "www.v-accel.ai"
};

const About = () => {
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
              className="max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="text-center">
                <span className="text-primary text-sm font-medium uppercase tracking-wider">About Us</span>
                <div className="mt-4 mb-7 space-y-3">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#252525] leading-[1.3]">
                    About <span className="text-gradient">V-Accel AI Dynamics</span>
                  </h1>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-12">
                  <p className="leading-[1.8] mb-4 text-muted-foreground">
                    A delivery-first technology company focused on governed software execution.
                  </p>
                  <p className="leading-[1.8] text-muted-foreground">
                    V-Accel AI Dynamics combines engineering discipline, QA rigor, legal structure, and infrastructure control to deliver enterprise-grade software without the overhead of traditional agencies.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Company Stats */}
        <section className="py-12 md:py-16 relative bg-background">
          <div className="absolute inset-0 bg-subtle-dots-small opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center glass-card rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">2020</div>
                  <div className="text-sm font-medium text-[#252525]">Founded</div>
                </div>
                <div className="text-center glass-card rounded-xl p-4">
                  <div className="text-lg md:text-xl font-bold text-primary mb-2">Chennai, India</div>
                  <div className="text-sm font-medium text-[#252525]">Headquarters</div>
                </div>
                <div className="text-center glass-card rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">40+</div>
                  <div className="text-sm font-medium text-[#252525]">Team Size</div>
                </div>
                <div className="text-center glass-card rounded-xl p-4">
                  <div className="text-xl md:text-2xl font-bold text-primary mb-2">₹10 Cr</div>
                  <div className="text-sm font-medium text-[#252525]">Revenue (FY 2024-25)</div>
                </div>
                <div className="text-center col-span-2 md:col-span-1 glass-card rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">150+</div>
                  <div className="text-sm font-medium text-[#252525]">Projects Delivered</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Our Business</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                What We Do
              </h2>
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
              {divisions.map((division, index) => (
                <motion.div
                  key={division.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <h3 className="text-2xl font-bold text-[#252525] mb-4">{division.name}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{division.description}</p>

                  {division.programs && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-[#252525] mb-3">Training Programs:</h4>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {division.programs.map((program, progIndex) => (
                          <li key={progIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{program}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {division.placement && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-semibold text-[#252525] mb-3">Placement Success:</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-primary">{division.placement.studentsPlaced}</div>
                          <div className="text-sm text-muted-foreground">students placed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{division.placement.partnerCompanies}</div>
                          <div className="text-sm text-muted-foreground">partner companies</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{division.placement.placementRate}</div>
                          <div className="text-sm text-muted-foreground">placement rate for eligible candidates</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We're Different */}
        <section className="py-16 md:py-20 relative bg-gradient-to-br from-[#4f5a67] via-[#4a5562] to-[#4f5a67] overflow-hidden">
          {/* Subtle pattern overlays */}
          <div className="absolute inset-0 bg-dark-pattern opacity-10" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="absolute inset-0 bg-dark-dots opacity-8" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          {/* Subtle gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-primary/8" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/3 to-transparent" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Differentiators</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-3">
                Why V-Accel Is Different
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Our unique approach combines training, delivery excellence, infrastructure, and compliance to deliver unmatched value.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {differentiators.map((diff, index) => (
                <motion.div
                  key={diff.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 group-hover:from-primary/50 group-hover:to-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 blur-xl" />
                    <diff.icon className="relative w-6 h-6 text-white group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary transition-colors">{diff.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{diff.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                What We Stand For
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#252525] mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recognition & Certifications */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Recognition</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Recognition & Certifications
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {recognition.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-[#252525] mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients By Industry */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                  Our Clients (By Industry)
                </h2>
              </div>

              <div className="glass-card rounded-2xl p-8">
                <div className="space-y-4">
                  {clientsByIndustry.map((client, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-[#252525] mb-1">{client.industry}: {client.percentage} of projects</div>
                        <div className="text-sm text-muted-foreground">{client.projects}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{client.percentage}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Social Impact</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mt-4 mb-4">
                Making a Difference
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                We're committed to creating opportunities and building a more inclusive technology ecosystem.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {socialImpact.map((impact, index) => (
                <motion.div
                  key={impact.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <impact.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#252525] mb-4">{impact.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{impact.description}</p>
                      {impact.stats && (
                        <div className="flex gap-6 pt-4 border-t border-border/50">
                          {impact.stats.map((stat, statIndex) => (
                            <div key={statIndex}>
                              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                              <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-organic-blobs opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />

          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-8">
                  Contact Information
                </h2>
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div>
                    <div className="font-semibold text-[#252525] mb-1">Corporate Office:</div>
                    <div className="text-muted-foreground">{contactInfo.company}</div>
                    <div className="text-muted-foreground">{contactInfo.address}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[#252525] mb-1">Email:</div>
                    <div className="text-muted-foreground">{contactInfo.email}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[#252525] mb-1">Website:</div>
                    <div className="text-muted-foreground">{contactInfo.website}</div>
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
                Join Us or Partner With Us
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact" className="group">
                    Explore Careers
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" asChild>
                  <Link to="/contact" className="group">
                    Discuss a Partnership
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

