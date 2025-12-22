import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";

const faqSections = [
  {
    title: "For Clients",
    questions: [
      {
        q: "How is ConnectAccel different from Upwork or Fiverr?",
        a: "We vet engineers (only top 3%), provide escrow protection, conduct code reviews, and offer dispute resolution. Upwork/Fiverr are self-serve platforms with no quality control. Additionally: You never interact with individual engineers - V-Accel manages all communication. No bidding wars - we source engineers internally and provide you with a single proposal. Quality assurance - all code is reviewed, tested, and security-scanned before delivery. Accountability - V-Accel owns the delivery, not the individual engineer."
      },
      {
        q: "Do I interact directly with the engineer?",
        a: "No. All communication flows through V-Accel. You interact with our project manager, who coordinates with the engineering team. This ensures: Consistent communication (no language barriers, timezone issues), Scope control (engineers can't negotiate directly with you), Quality oversight (we review all deliverables before presenting to you)."
      },
      {
        q: "What if the engineer disappears or doesn't deliver?",
        a: "Your payment is held in escrow until milestone delivery. If an engineer fails to deliver: We reassign the project to another engineer at no additional cost. Your milestone payment is not released until delivery is complete. V-Accel absorbs the cost of reassignment—you're not penalized. We've had zero project abandonments in our 150+ projects delivered."
      },
      {
        q: "Who owns the source code?",
        a: "You own complete IP rights upon final payment. During development: Code is held in V-Accel infrastructure for security. Engineers never have ownership—they're contractors bound by IP transfer agreements. Upon final payment, we transfer all code to your specified repository. You can do whatever you want with the code (deploy, modify, sell, open-source)."
      },
      {
        q: "What if I'm not satisfied with the quality?",
        a: "Each milestone has a review period. If quality doesn't meet agreed acceptance criteria: We require revisions before releasing payment (no additional cost). Serious quality issues trigger free rework (e.g., critical bugs, security vulnerabilities). If quality is consistently poor, we reassign the project to a different team. Our internal QA process catches 90%+ of issues before they reach you."
      },
      {
        q: "How long does it take to get started?",
        a: "Technical scoping call: Within 24 hours of inquiry. Proposal delivery: 48-72 hours after scoping call. Contract execution: 1-2 business days. Project kick-off: 3-5 business days after contract. Total time from inquiry to project start: 1-2 weeks."
      },
      {
        q: "What's your typical project size?",
        a: "Minimum project value: ₹5 lakhs. Average project size: ₹15-30 lakhs. Largest project delivered: ₹2 crore (enterprise ERP integration)."
      },
      {
        q: "Do you offer ongoing maintenance?",
        a: "Yes. Options: 90-day warranty (included): Bug fixes for issues present at delivery. Extended warranty: ₹50,000 - 2 lakhs/month for bug fixes beyond 90 days. Ongoing maintenance SLA: ₹1-5 lakhs/month for bug fixes + minor updates + monitoring. Dedicated support team: ₹3-8 lakhs/month for 24/7 support + incident response."
      },
      {
        q: "What about confidentiality and NDA?",
        a: "All engineers sign NDAs before project details are shared. We can sign your company's standard NDA template. Projects are isolated—engineers working on Project A cannot see Project B code. Data is stored in encrypted repositories with access logging."
      },
      {
        q: "Can I hire the engineer full-time after the project?",
        a: "Yes, with a one-time placement fee (typically 15-20% of annual salary). This covers: Recruiting and vetting costs we incurred. Transition period where engineer completes remaining tasks. Knowledge transfer and handoff."
      },
      {
        q: "What if my requirements change mid-project?",
        a: "Depends on the contract type: Fixed-Price Projects: Scope is locked per SOW. Changes require Change Request (CR) with additional cost estimation. Minor tweaks (e.g., UI adjustments) are usually accommodated. Major changes (e.g., new features) trigger CR negotiation. Time & Materials Projects: Flexible scope—requirements can evolve. You pay for actual hours worked. Weekly/bi-weekly invoicing."
      },
      {
        q: "What's your refund policy?",
        a: "Escrow-based protection: Payment released only upon milestone approval. No upfront payment at risk: If we fail to deliver Milestone 1, you get 100% refund. Mid-project cancellation: Unused escrow funds refunded (minus work completed)."
      }
    ]
  },
  {
    title: "For Engineers",
    questions: [
      {
        q: "How do I get paid?",
        a: "Payment is released from escrow upon milestone approval: Client approves milestone. V-Accel releases payment from escrow. You receive payment within 7 business days. Payment methods: Bank transfer (NEFT/RTGS), UPI. Average payment cycle: 7-10 days after milestone approval."
      },
      {
        q: "What percentage does ConnectAccel take?",
        a: "Our business model is not a simple platform fee. Instead: V-Accel negotiates rates with engineers. V-Accel negotiates project pricing with clients. Engineers receive their agreed hourly/project rate. V-Accel's margin is built into client pricing (not deducted from engineer payment). Example: Your rate: ₹2,500/hr. Hours: 100 hours. You receive: ₹2.5 lakhs (100% of your rate). Client pays V-Accel: ₹3.5 - 4 lakhs (includes our margin + overhead)."
      },
      {
        q: "Can I work with clients outside the platform?",
        a: "No. All projects must go through ConnectAccel platform. Circumventing the platform results in: Immediate account termination. Forfeiture of pending payments. Legal action per service agreement. Why this rule? We invest heavily in vetting, infrastructure, and client relationships. Bypassing the platform undermines the business model."
      },
      {
        q: "How many projects can I work on simultaneously?",
        a: "As many as you can handle responsibly. However: We recommend not exceeding 2-3 active projects for quality reasons. If client ratings drop below 4.0/5.0 due to overcommitment, we may limit concurrent projects. Full-time project assignments (40 hours/week) are exclusive."
      },
      {
        q: "What if the client doesn't pay?",
        a: "This is impossible. Payment is in escrow before work begins. V-Accel releases payment based on milestone delivery, regardless of client payment disputes. If a client disputes payment: V-Accel mediates the dispute. If legitimate quality issue → we require revisions. If frivolous dispute → V-Accel pays you from our funds and pursues client separately. You are never at risk of non-payment."
      },
      {
        q: "Do I need to pay to join?",
        a: "No. ConnectAccel is free for engineers. No sign-up fees, no subscription fees, no hidden charges. We make money through project margins, not engineer fees."
      },
      {
        q: "Can I lose my account?",
        a: "Yes, if: Client ratings drop below 4.0/5.0 consistently. You miss deadlines repeatedly without valid reason. Code quality issues flagged in multiple reviews. Unprofessional behavior (rude communication, non-responsiveness). Attempting to circumvent platform (contacting clients directly). Process: First warning: We provide feedback and improvement plan. Second warning: Probation period (3 months to improve rating). Final warning: Account suspended temporarily. Termination: Account permanently deactivated."
      },
      {
        q: "How are projects assigned?",
        a: "Engineers are matched to projects based on: Skills match: Your expertise aligns with project requirements. Availability: You have capacity for the project timeline. Past performance: Higher-rated engineers get priority. Specialization: Domain expertise (FinTech, HealthTech, etc.). You cannot \"bid\" on projects. Projects are assigned to you by V-Accel."
      },
      {
        q: "What if I'm not selected for any projects?",
        a: "Possible reasons: Your skills don't match current project demand. Your availability doesn't align with project timelines. Lower ratings compared to other engineers. Market slowdown (fewer projects overall). Solutions: Update your skills profile with new technologies. Increase availability (flexible timelines = more opportunities). Improve ratings on current projects. Typical time between projects: 1-4 weeks (depending on market demand)."
      },
      {
        q: "Can I see client details?",
        a: "No. Client identity is anonymized until project assignment. After assignment: You know the client's industry (e.g., \"FinTech startup\"). You don't know the company name or client contact details. All communication flows through V-Accel PM. Why? To prevent engineers from contacting clients directly and bypassing the platform."
      }
    ]
  },
  {
    title: "General Questions",
    questions: [
      {
        q: "What geographies do you serve?",
        a: "Primary: India (all major cities). Secondary: UAE, Singapore, UK, USA (remote projects). Language support: English, Tamil, Hindi."
      },
      {
        q: "Do you provide invoices for tax purposes?",
        a: "For clients: Yes, GST-compliant invoices (Form GSTR-1). For engineers: Yes, TDS certificates (Form 16A) issued quarterly."
      },
      {
        q: "How do I escalate issues?",
        a: "Escalation path: Project Manager (first point of contact). Engineering Lead (for technical disputes). Operations Head (for contractual disputes). CEO (final escalation for unresolved issues). Response times: PM: 24 hours. Engineering Lead: 48 hours. Operations Head: 72 hours. CEO: 5 business days."
      }
    ]
  }
];

const FAQ = () => {
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">FAQ</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Find answers to common questions about ConnectAccel, our process, and how we work.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-24 relative bg-background">
          <div className="absolute inset-0 bg-perspective-depth" />

          <div className="container mx-auto px-6 relative">
            <div className="max-w-5xl mx-auto space-y-16">
              {faqSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <HelpCircle className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold text-[#252525]">{section.title}</h2>
                  </div>

                  <div className="glass-card rounded-2xl p-8">
                    <Accordion type="single" collapsible className="w-full">
                      {section.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${sectionIndex}-${index}`} className="border-b border-border/50">
                          <AccordionTrigger className="text-left font-semibold text-[#252525] hover:no-underline py-4">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                            <div className="whitespace-pre-line">{faq.a}</div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                Still Have Questions?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Can't find what you're looking for? Contact our support team.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Contact Support
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

export default FAQ;

