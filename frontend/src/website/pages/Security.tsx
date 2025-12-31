import { motion } from "framer-motion";
import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { 
  Shield, 
  Lock, 
  Database, 
  GitBranch, 
  Cloud, 
  Eye,
  FileCheck,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const securitySections = [
  {
    title: "Source Code Ownership",
    icon: GitBranch,
    headline: "All source code is developed inside V-Accel-controlled infrastructure. Software engineers never retain IP ownership.",
    subsections: [
      {
        subtitle: "Infrastructure",
        items: [
          "Enterprise GitHub/GitLab with branch protection rules",
          "All repositories owned by V-Accel organization",
          "Engineers have temporary collaborator access (revoked post-project)",
          "No forking or cloning to personal accounts permitted"
        ]
      },
      {
        subtitle: "Enforcement",
        items: [
          "All commits are signed and logged with full audit trail",
          "Downloads outside approved environments blocked by policy",
          "IP transfer clause in all engineer service agreements",
          "Client receives complete IP rights upon final payment"
        ]
      }
    ]
  },
  {
    title: "Client Code Security",
    icon: Shield,
    subsections: [
      {
        subtitle: "Isolation",
        items: [
          "Client projects in separate repository namespaces",
          "No cross-project visibility for engineers",
          "Environment variables and secrets in vault (HashiCorp Vault / AWS Secrets Manager)",
          "Database access restricted to specific engineers with justified need"
        ]
      },
      {
        subtitle: "Compliance",
        items: [
          "SOC 2 Type II practices (in progress)",
          "GDPR-compliant data handling for international projects",
          "ISO 27001 security standards alignment",
          "Regular security audits and penetration testing"
        ]
      }
    ]
  },
  {
    title: "Engineering Infrastructure Control",
    icon: Cloud,
    subsections: [
      {
        subtitle: "Cloud Environments",
        items: [
          "Dedicated dev/staging/prod environments per project",
          "Infrastructure as Code (Terraform/CloudFormation) for repeatability",
          "Cost allocation and monitoring per project",
          "Auto-termination of unused resources to prevent cost leakage"
        ]
      },
      {
        subtitle: "Access Management",
        items: [
          "Role-based access control (RBAC)—minimum necessary privileges",
          "Multi-factor authentication (MFA) required for all system access",
          "Session recording for sensitive operations (prod deployments, DB access)",
          "Quarterly access reviews to remove unnecessary permissions"
        ]
      }
    ]
  },
  {
    title: "Audit & Traceability",
    icon: Eye,
    subsections: [
      {
        subtitle: "Activity Logging",
        items: [
          "All Git commits with author, timestamp, and change description",
          "Login/logout events across all systems",
          "File access logs for sensitive documents",
          "API call logs with request/response payloads (sanitized for PII)"
        ]
      },
      {
        subtitle: "Milestone Tracking",
        items: [
          "Kanban/Scrum board visibility for clients (Jira/Linear/Monday.com)",
          "Burndown charts showing progress toward milestone completion",
          "Velocity tracking to predict future delivery timelines",
          "Time-tracking integration for time & materials projects"
        ]
      },
      {
        subtitle: "Delivery History",
        items: [
          "Full project repository archived after completion",
          "Documentation snapshots (technical specs, architecture decisions, runbooks)",
          "Communication logs (sanitized, stored for 2 years)",
          "Performance metrics (uptime, response times, bug counts)"
        ]
      }
    ]
  },
  {
    title: "Financial Governance",
    icon: FileCheck,
    subsections: [
      {
        subtitle: "Escrow Structure",
        items: [
          "Third-party escrow service (Escrow.com) OR V-Accel trust account",
          "Milestone-wise tranches released only upon approval",
          "Auto-release on approval OR manual review for complex milestones",
          "Client can withhold payment only for non-delivery per milestone criteria"
        ]
      },
      {
        subtitle: "Payment Terms",
        items: [
          "NET 7 for milestone invoices after approval",
          "Multiple payment methods: Bank transfer, wire, credit card (3% processing fee)",
          "GST/tax handling automated with proper documentation",
          "Invoice generation with GST compliance (Form GSTR-1)"
        ]
      },
      {
        subtitle: "Dispute Resolution",
        items: [
          "Mediation by V-Accel technical team (first recourse)",
          "If unresolved within 7 days → binding arbitration per contract terms",
          "Escrow funds held until resolution (interest accrues to client)",
          "Clear escalation path defined in SOW"
        ]
      }
    ]
  }
];

const riskCategories = [
  {
    category: "Delivery Risk",
    vaccelOwns: "Timeline adherence, technical feasibility, architectural soundness",
    clientOwns: "Requirement clarity, timely feedback, acceptance criteria definition"
  },
  {
    category: "Quality Risk",
    vaccelOwns: "Code quality, security vulnerabilities, performance issues",
    clientOwns: "Business logic validation, user acceptance testing"
  },
  {
    category: "Financial Risk",
    vaccelOwns: "Engineer payment regardless of client payment disputes",
    clientOwns: "Escrow funding before work begins"
  },
  {
    category: "IP Risk",
    vaccelOwns: "Source code security during development",
    clientOwns: "Complete IP rights upon final payment"
  }
];

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-dark-pattern" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="absolute inset-0 bg-dark-dots opacity-30" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="text-primary/80 text-sm font-medium uppercase tracking-wider">Control & Security</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
                How We Protect Your Software,{" "}
                <span className="text-gradient">Code, and IP</span>
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade security, governance, and control at every layer of execution.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Source Code Ownership - Featured */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GitBranch className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-2">
                      Source Code Ownership
                    </h2>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  All source code is developed inside V-Accel-controlled infrastructure. Software engineers never retain IP ownership.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  {securitySections[0].subsections.map((subsection, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-[#252525] mb-4">{subsection.subtitle}</h3>
                      <ul className="space-y-3">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security Sections */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-mesh-gradient opacity-15" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <div className="max-w-7xl mx-auto space-y-16">
              {securitySections.slice(1).map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#252525]">{section.title}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.subsections.map((subsection, subIndex) => (
                      <motion.div
                        key={subIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (sectionIndex * 0.1) + (subIndex * 0.05) }}
                        className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all"
                      >
                        <h3 className="text-lg font-semibold text-[#252525] mb-4">{subsection.subtitle}</h3>
                        <ul className="space-y-3">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Transfer Statement */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-8 text-center">
                  Risk Transfer Statement
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-12">
                  Software delivery risk sits with V-Accel—not with individual developers.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 px-4 font-semibold text-[#252525]">Risk Category</th>
                        <th className="text-left py-4 px-4 font-semibold text-[#252525]">V-Accel Owns</th>
                        <th className="text-left py-4 px-4 font-semibold text-[#252525]">Client Owns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskCategories.map((risk, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-4 px-4 font-medium text-[#252525]">{risk.category}</td>
                          <td className="py-4 px-4 text-muted-foreground">{risk.vaccelOwns}</td>
                          <td className="py-4 px-4 text-muted-foreground">{risk.clientOwns}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                Secure Your Next Project
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience enterprise-grade security and governance without the overhead.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Discuss Your Security Requirements
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

export default Security;

