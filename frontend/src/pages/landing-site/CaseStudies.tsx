import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Code
} from "lucide-react";

const caseStudies = [
  {
    title: "FinTech Lending Platform",
    client: "Series B-funded digital lending startup",
    note: "Name withheld per NDA",
    challenge: "Build a credit assessment engine and borrower portal in 4 months for regulatory launch deadline.",
    requirements: [
      "Real-time credit scoring using ML",
      "Integration with CIBIL and bank statement analysis APIs",
      "Borrower self-service portal",
      "Lender dashboard for loan review",
      "Compliance with RBI digital lending guidelines"
    ],
    solution: {
      architecture: "Microservices architecture (Node.js backend, Python ML service)",
      frontend: "React frontend with mobile-responsive design",
      database: "PostgreSQL for structured data, MongoDB for unstructured data",
      caching: "Redis for caching and session management",
      deployment: "Deployed on AWS with ECS (containerized services)"
    },
    team: [
      "1 Tech Lead",
      "2 Backend Engineers (Node.js, Python)",
      "1 Frontend Engineer (React)",
      "1 ML Engineer (credit scoring model)",
      "1 QA Engineer",
      "1 DevOps Engineer"
    ],
    timeline: "16 weeks from kick-off to production launch",
    results: [
      "On-Time Launch: Delivered 2 days before regulatory deadline",
      "Production-Ready: Processing 500+ loan applications per day within 3 months",
      "Zero Critical Bugs: No critical issues in first 90 days post-launch",
      "High Availability: 99.9% uptime maintained",
      "Scalability: System auto-scales to handle 10x load spikes"
    ],
    testimonial: {
      quote: "V-Accel delivered our core platform in 16 weeks when other vendors quoted 8-10 months. The code quality and architecture were enterprise-grade. They understood fintech compliance requirements better than most agencies we spoke with. Most importantly, they hit our regulatory deadline—which was non-negotiable.",
      author: "VP Engineering",
      note: "Name withheld"
    },
    techStack: {
      backend: "Node.js, Python (Flask), PostgreSQL, MongoDB, Redis",
      frontend: "React, TypeScript, Material-UI",
      ml: "Python, scikit-learn, pandas, NumPy",
      infrastructure: "AWS ECS, RDS, S3, CloudFront, Route 53",
      cicd: "GitHub Actions, Docker, Terraform",
      monitoring: "CloudWatch, Sentry for error tracking"
    }
  },
  {
    title: "HealthTech Telemedicine Platform",
    client: "Healthcare startup",
    note: "Seed-funded, 10 employees",
    challenge: "Build an MVP telemedicine platform in 10 weeks to pilot with 3 partner clinics.",
    requirements: [
      "Video consultation (doctor-patient)",
      "Electronic Health Records (EHR) management",
      "Prescription generation",
      "Payment integration",
      "HIPAA-compliant data storage"
    ],
    solution: {
      architecture: "Monolithic Rails backend for rapid MVP development",
      mobile: "React Native for cross-platform mobile app (iOS + Android)",
      database: "PostgreSQL with encrypted fields for PHI (Protected Health Information)",
      video: "Twilio Video API for consultations",
      payment: "Stripe for payment processing",
      deployment: "AWS with HIPAA-compliant configuration"
    },
    team: [
      "1 Tech Lead",
      "1 Backend Engineer (Ruby on Rails)",
      "1 Mobile Engineer (React Native)",
      "1 QA Engineer"
    ],
    timeline: "10 weeks from kick-off to pilot launch",
    results: [
      "Rapid MVP: Delivered functional MVP in 10 weeks",
      "Pilot Success: 3 clinics onboarded, 200+ consultations in first month",
      "HIPAA Compliance: Passed security audit on first attempt",
      "Patient Satisfaction: 4.7/5.0 average rating",
      "Follow-On Funding: Client raised Series A based on successful pilot"
    ],
    testimonial: {
      quote: "We needed an MVP fast to secure our Series A. V-Accel delivered in 10 weeks with HIPAA compliance out of the box. Their healthcare domain knowledge saved us months of back-and-forth.",
      author: "Founder & CEO"
    },
    techStack: {
      backend: "Ruby on Rails, PostgreSQL (encrypted), Sidekiq",
      mobile: "React Native, TypeScript",
      video: "Twilio Video API",
      infrastructure: "AWS (HIPAA-compliant setup), RDS, S3 with encryption",
      cicd: "GitHub Actions, CodeDeploy"
    }
  },
  {
    title: "E-Commerce Marketplace for Electronics",
    client: "E-commerce company",
    note: "Series A, expanding product categories",
    challenge: "Build a B2B2C marketplace for electronics sellers and buyers in 14 weeks.",
    requirements: [
      "Multi-vendor product catalog",
      "Inventory management for sellers",
      "Order fulfillment automation",
      "Payment settlement to vendors",
      "Admin dashboard for platform management"
    ],
    solution: {
      architecture: "Microservices: Product service, Order service, Payment service, Notification service",
      backend: "Node.js + Express for backend services",
      frontend: "Next.js for SEO-optimized storefront",
      database: "PostgreSQL for transactional data, Elasticsearch for product search",
      messaging: "RabbitMQ for asynchronous order processing",
      deployment: "Deployed on AWS with Kubernetes (EKS)"
    },
    team: [
      "1 Tech Lead",
      "2 Backend Engineers (Node.js, microservices)",
      "1 Frontend Engineer (Next.js)",
      "1 DevOps Engineer (Kubernetes)",
      "1 QA Engineer"
    ],
    timeline: "14 weeks from kick-off to production launch",
    results: [
      "Successful Launch: 50 vendors onboarded in first month",
      "Product Catalog: 10,000+ SKUs indexed and searchable",
      "Order Volume: Processing 200+ orders per day within 8 weeks",
      "Search Performance: Sub-200ms product search response times",
      "Payment Automation: Vendor payouts automated (bi-weekly settlements)"
    ],
    testimonial: {
      quote: "We needed a robust marketplace platform that could handle thousands of products and multiple vendors. V-Accel architected a solution that scaled from day one. The Elasticsearch integration made product search lightning-fast.",
      author: "CTO"
    },
    techStack: {
      backend: "Node.js, Express, PostgreSQL, Elasticsearch, RabbitMQ",
      frontend: "Next.js, React, Tailwind CSS",
      infrastructure: "AWS EKS (Kubernetes), RDS, ElastiCache (Redis)",
      cicd: "GitLab CI, Docker, Helm charts",
      monitoring: "Prometheus, Grafana, ELK stack"
    }
  }
];

const successMetrics = [
  { metric: "On-Time Delivery Rate", value: "92%", note: "(within ±1 week)" },
  { metric: "Client Satisfaction (NPS)", value: "68", note: "(Promoter score)" },
  { metric: "Critical Bugs (First 30 Days)", value: "<3", note: "per project" },
  { metric: "Test Coverage", value: ">85%", note: "for backend code" },
  { metric: "Uptime (Production)", value: ">99.5%", note: "" },
  { metric: "Client Repeat Rate", value: "45%", note: "(clients return for additional projects)" }
];

const CaseStudies = () => {
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Case Studies</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                Real Projects.{" "}
                <span className="text-gradient">Real Results.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                See how we've helped clients deliver enterprise-grade software on time and on budget.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <div className="max-w-7xl mx-auto space-y-24">
              {caseStudies.map((study, studyIndex) => (
                <motion.div
                  key={study.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: studyIndex * 0.1 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-4">
                      Case Study {studyIndex + 1}: {study.title}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                      <span className="font-medium">{study.client}</span>
                      {study.note && <span className="text-sm">({study.note})</span>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Challenge */}
                    <div className="glass-card rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-[#252525] mb-4">Challenge</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{study.challenge}</p>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-[#252525] mb-2">Required:</div>
                        <ul className="space-y-2">
                          {study.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Solution */}
                    <div className="glass-card rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-[#252525] mb-4">Solution</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-[#252525] mb-1">Architecture:</div>
                          <div className="text-sm text-muted-foreground">{study.solution.architecture}</div>
                        </div>
                        {study.solution.frontend && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Frontend:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.frontend}</div>
                          </div>
                        )}
                        {study.solution.mobile && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Mobile:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.mobile}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-[#252525] mb-1">Database:</div>
                          <div className="text-sm text-muted-foreground">{study.solution.database}</div>
                        </div>
                        {study.solution.caching && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Caching:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.caching}</div>
                          </div>
                        )}
                        {study.solution.messaging && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Messaging:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.messaging}</div>
                          </div>
                        )}
                        {study.solution.video && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Video:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.video}</div>
                          </div>
                        )}
                        {study.solution.payment && (
                          <div>
                            <div className="text-sm font-medium text-[#252525] mb-1">Payment:</div>
                            <div className="text-sm text-muted-foreground">{study.solution.payment}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-[#252525] mb-1">Deployment:</div>
                          <div className="text-sm text-muted-foreground">{study.solution.deployment}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team & Timeline */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-[#252525] mb-4">Team Composition:</h3>
                      <ul className="space-y-2">
                        {study.team.map((member, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{member}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-[#252525] mb-4">Timeline:</h3>
                      <div className="text-2xl font-bold text-primary mb-2">{study.timeline}</div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-[#252525] mb-6">Results</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {study.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-[#252525] font-medium">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="glass-card rounded-2xl p-8 bg-primary/5 border-2 border-primary/20">
                    <p className="text-lg text-[#252525] leading-relaxed italic mb-6">"{study.testimonial.quote}"</p>
                    <div className="pt-4 border-t border-border/50">
                      <div className="font-semibold text-[#252525]">— {study.testimonial.author}</div>
                      {study.testimonial.note && (
                        <div className="text-sm text-muted-foreground mt-1">{study.testimonial.note}</div>
                      )}
                    </div>
                  </div>

                  {/* Technology Stack */}
                  <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-[#252525] mb-6">Technology Stack</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(study.techStack).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-sm font-medium text-[#252525] mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</div>
                          <div className="text-sm text-muted-foreground">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Metrics */}
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
                  Key Success Metrics Across Projects
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {successMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                    <div className="text-[#252525] font-semibold mb-1">{metric.metric}</div>
                    {metric.note && (
                      <div className="text-sm text-muted-foreground">{metric.note}</div>
                    )}
                  </motion.div>
                ))}
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
                See If We Can Deliver Similar Results for You
              </h2>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Discuss Your Project
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

export default CaseStudies;

