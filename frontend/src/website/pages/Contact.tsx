import { motion } from "framer-motion";
import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { Button } from "@website/components/ui/button";
import { Input } from "@website/components/ui/input";
import { Textarea } from "@website/components/ui/textarea";
import { Label } from "@website/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Use environment variable or fallback to default URL
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 
      'https://script.google.com/macros/s/AKfycbyxYKJMR-WnoSfjpWmnKIPiysWUdSiTs4_bJNukwxzqzmvUTm4OkUWS4gSJez_q55vc/exec';
      
      // Create form data for Google Apps Script (works better with CORS)
      const formDataToSend = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        company: formData.company || 'Not provided',
        projectType: formData.projectType,
        message: formData.message,
      });
      
      // Use no-cors mode for Google Apps Script to avoid CORS issues
      // This prevents reading the response, but the script will still execute
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString(),
      });
      
      // Since we're using no-cors, we can't read the response
      // Assume success if no error is thrown
      setIsSuccess(true);
      toast.success("Thank you! We'll be in touch within 24 hours.");
      setFormData({ name: "", email: "", company: "", projectType: "", message: "" });
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mb-6">
                Discuss Your Software{" "}
                <span className="text-gradient">Execution Gap</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                One conversation. No sales theatre. Get a technical scoping call within 24 hours.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mt-12 items-stretch">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex h-full"
              >
                <div className="glass-card rounded-2xl p-8 flex flex-col w-full h-full">
                  <h2 className="text-2xl font-semibold text-[#252525] mb-8">
                    Submit Your Requirement
                  </h2>
                  
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center py-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#252525] mb-3">
                        Thank You!
                      </h3>
                      <p className="text-lg text-muted-foreground mb-2">
                        Your requirement has been submitted successfully.
                      </p>
                      <p className="text-muted-foreground">
                        We'll be in touch within 24 hours.
                      </p>
                      <Button
                        onClick={() => setIsSuccess(false)}
                        variant="outline"
                        className="mt-6"
                      >
                        Submit Another Requirement
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-[#252525]">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-background/50 border-border/50 focus:border-primary"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[#252525]">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-background/50 border-border/50 focus:border-primary"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-[#252525]">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="bg-background/50 border-border/50 focus:border-primary"
                          placeholder="Your company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectType" className="text-[#252525]">Project Type *</Label>
                        <select
                          id="projectType"
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                          required
                          className="w-full h-10 rounded-lg bg-background/50 border border-border/50 px-3 text-[#252525] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">Select project type</option>
                          <option value="mvp">MVP / Product Development</option>
                          <option value="enterprise">Enterprise Application</option>
                          <option value="module">Backend/Frontend Module</option>
                          <option value="platform">Platform Development</option>
                          <option value="white-label">White-Label Engineering</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-[#252525]">Project Description *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={14}
                          className="bg-background/50 border-border/50 focus:border-primary resize-none min-h-[160px]"
                          placeholder="Describe your software requirement, timeline expectations, and any specific technology preferences..."
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Requirement"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                  )}
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-8"
              >
                {/* Schedule Call Card */}
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#252525]">
                      Schedule a Scoping Call
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Prefer to talk directly? Schedule a 30-minute technical discovery call with our engineering team.
                  </p>
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                      Book on Calendly
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {/* Email Card */}
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#252525]">
                      Email Us Directly
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Have a detailed requirement document? Send it directly to our technical team.
                  </p>
                  <a 
                    href="mailto:info@connectaccel.com" 
                    className="text-primary hover:text-primary-hover transition-colors font-medium"
                  >
                    info@connectaccel.com
                  </a>
                </div>

                {/* What to Expect */}
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-xl font-semibold text-[#252525] mb-6">
                    What to Expect
                  </h2>
                  <ul className="space-y-4">
                    {[
                      "Response within 24 hours",
                      "Technical feasibility assessment",
                      "No-obligation scoping call",
                      "Detailed proposal within 3 business days",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
