import { motion } from "framer-motion";
import { Navbar } from "@website/components/Navbar";
import { Footer } from "@website/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@website/components/ui/button";
import { 
  Code, 
  Smartphone, 
  Brain, 
  Cloud, 
  Shield, 
  Database,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";

const techCategories = [
  {
    title: "Web Application Development",
    icon: Code,
    subsections: [
      {
        subtitle: "Frontend Technologies",
        items: [
          "Frameworks: React, Vue.js, Angular, Next.js, Nuxt.js",
          "Languages: TypeScript, JavaScript (ES6+)",
          "Styling: Tailwind CSS, Material-UI, Ant Design, styled-components, SASS/SCSS",
          "State Management: Redux, MobX, Zustand, Recoil",
          "Build Tools: Webpack, Vite, esbuild",
          "Testing: Jest, React Testing Library, Cypress, Playwright"
        ]
      },
      {
        subtitle: "Backend Technologies",
        items: [
          "Languages & Frameworks: Node.js (Express, NestJS, Fastify), Python (Django, Flask, FastAPI), Java (Spring Boot), Go (Gin, Echo), .NET Core (C#), Ruby on Rails",
          "Databases: PostgreSQL, MySQL, SQL Server, Oracle, MongoDB, DynamoDB, Cassandra, CouchDB, Redis, Memcached",
          "Search: Elasticsearch, Algolia, MeiliSearch",
          "APIs & Communication: REST APIs, GraphQL (Apollo, Hasura), gRPC, WebSockets",
          "Message Queues: RabbitMQ, Apache Kafka, AWS SQS, Redis Pub/Sub"
        ]
      }
    ]
  },
  {
    title: "Mobile Application Development",
    icon: Smartphone,
    subsections: [
      {
        subtitle: "Cross-Platform",
        items: [
          "React Native: iOS + Android with single codebase",
          "Flutter: High-performance native apps with Dart",
          "Ionic: Hybrid apps with web technologies"
        ]
      },
      {
        subtitle: "Native",
        items: [
          "iOS: Swift, SwiftUI, UIKit",
          "Android: Kotlin, Jetpack Compose, Android SDK"
        ]
      },
      {
        subtitle: "Backend for Mobile",
        items: [
          "Firebase (Authentication, Firestore, Cloud Functions)",
          "AWS Amplify",
          "Custom REST/GraphQL APIs"
        ]
      }
    ]
  },
  {
    title: "AI/ML & Data Engineering",
    icon: Brain,
    subsections: [
      {
        subtitle: "Machine Learning Frameworks",
        items: [
          "Deep Learning: TensorFlow, PyTorch, Keras",
          "Classical ML: scikit-learn, XGBoost, LightGBM",
          "NLP: Hugging Face Transformers, spaCy, NLTK",
          "Computer Vision: OpenCV, YOLO, Detectron2"
        ]
      },
      {
        subtitle: "AI Applications",
        items: [
          "NLP: Chatbots, sentiment analysis, text classification, named entity recognition (NER)",
          "Computer Vision: Object detection, image classification, face recognition, OCR",
          "Recommendation Systems: Collaborative filtering, content-based filtering",
          "Predictive Analytics: Time-series forecasting, churn prediction, demand forecasting"
        ]
      },
      {
        subtitle: "Data Engineering",
        items: [
          "ETL/ELT: Apache Airflow, dbt (data build tool), Talend",
          "Data Warehousing: Snowflake, Amazon Redshift, Google BigQuery",
          "Big Data: Apache Spark, Hadoop",
          "Streaming: Apache Kafka, AWS Kinesis, Flink"
        ]
      }
    ]
  },
  {
    title: "DevOps & Cloud Infrastructure",
    icon: Cloud,
    subsections: [
      {
        subtitle: "Cloud Platforms",
        items: [
          "AWS: EC2, ECS, EKS, Lambda, RDS, S3, CloudFront, Route 53, API Gateway",
          "Azure: App Service, AKS, Functions, SQL Database, Blob Storage, CDN",
          "Google Cloud: Compute Engine, GKE, Cloud Functions, Cloud SQL, Cloud Storage"
        ]
      },
      {
        subtitle: "Containerization & Orchestration",
        items: [
          "Docker: Container images, multi-stage builds",
          "Kubernetes: Deployment, scaling, service mesh (Istio)",
          "Container Registries: Docker Hub, AWS ECR, Google Container Registry"
        ]
      },
      {
        subtitle: "CI/CD Pipelines",
        items: [
          "Tools: GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI",
          "Deployment Strategies: Blue-green, canary, rolling deployments",
          "Artifact Management: Nexus, Artifactory"
        ]
      },
      {
        subtitle: "Infrastructure as Code",
        items: [
          "Terraform: Multi-cloud infrastructure provisioning",
          "AWS CloudFormation: AWS-specific infrastructure",
          "Ansible: Configuration management and automation"
        ]
      },
      {
        subtitle: "Monitoring & Observability",
        items: [
          "Metrics: Prometheus, Grafana, CloudWatch, Datadog, New Relic",
          "Logging: ELK Stack (Elasticsearch, Logstash, Kibana), Loki, Splunk",
          "Tracing: Jaeger, Zipkin, AWS X-Ray",
          "Error Tracking: Sentry, Rollbar, Bugsnag"
        ]
      }
    ]
  },
  {
    title: "Specialized Domains",
    icon: Shield,
    subsections: [
      {
        subtitle: "FinTech",
        items: [
          "Payment Gateways: Razorpay, Stripe, PayPal, Braintree",
          "Banking APIs: Plaid, Yodlee, Finicity",
          "Compliance: KYC/AML workflows, PCI-DSS compliance",
          "Blockchain: Smart contracts (Solidity, Ethereum), DeFi protocols"
        ]
      },
      {
        subtitle: "HealthTech",
        items: [
          "Telemedicine: Twilio Video, Agora.io, Zoom SDK",
          "EHR Integration: FHIR, HL7 standards",
          "Compliance: HIPAA-compliant architecture, PHI encryption",
          "Medical Devices: IoT integration, data streaming from wearables"
        ]
      },
      {
        subtitle: "E-Commerce",
        items: [
          "Platforms: Shopify (app development), WooCommerce, Magento",
          "Inventory Management: Stock sync, multi-warehouse support",
          "Shipping Integration: ShipRocket, Shiprocket, FedEx, UPS APIs",
          "Analytics: Google Analytics, Mixpanel, Segment"
        ]
      },
      {
        subtitle: "SaaS & B2B Platforms",
        items: [
          "Multi-Tenancy: Tenant isolation, schema-per-tenant, shared database with row-level security",
          "Subscription Billing: Stripe Billing, Chargebee, Recurly",
          "Analytics Dashboards: Real-time metrics, custom reporting",
          "API Development: RESTful APIs, GraphQL, Webhooks, API versioning"
        ]
      },
      {
        subtitle: "Enterprise Systems",
        items: [
          "ERP Integration: SAP, Oracle, Microsoft Dynamics",
          "CRM Integration: Salesforce, HubSpot, Zoho CRM",
          "Workflow Automation: Zapier, Make (Integromat), custom automation"
        ]
      }
    ]
  },
  {
    title: "Quality Assurance & Testing",
    icon: Database,
    subsections: [
      {
        subtitle: "Test Automation",
        items: [
          "Unit Testing: Jest, Mocha, Chai, PyTest, JUnit",
          "Integration Testing: Supertest, TestContainers",
          "End-to-End Testing: Cypress, Playwright, Selenium",
          "API Testing: Postman, REST Assured, Karate"
        ]
      },
      {
        subtitle: "Performance Testing",
        items: [
          "Load Testing: Apache JMeter, Gatling, k6",
          "Stress Testing: Locust, Artillery",
          "Profiling: Chrome DevTools, Lighthouse, WebPageTest"
        ]
      },
      {
        subtitle: "Security Testing",
        items: [
          "SAST (Static Analysis): SonarQube, Checkmarx, Veracode",
          "DAST (Dynamic Analysis): OWASP ZAP, Burp Suite",
          "Dependency Scanning: Snyk, Dependabot, npm audit"
        ]
      }
    ]
  }
];

const excludedServices = [
  "Desktop application development (Windows, macOS, Linux native apps)",
  "Hardware/firmware development",
  "Game development (Unity, Unreal Engine)",
  "Blockchain smart contract audits (security auditing)",
  "Non-technical services (design-only, marketing, content creation)"
];

const Technology = () => {
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Technology Stack</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#252525] mt-4 mb-6">
                Our Engineering <span className="text-gradient">Stack</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Modern technologies, proven frameworks, and enterprise-grade tools for scalable software development.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Technology Categories */}
        <section className="py-24 relative bg-background overflow-hidden">
          <div className="absolute inset-0 bg-perspective-depth" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background/80" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <div className="max-w-7xl mx-auto space-y-24">
              {techCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-5 mb-12 pb-8 border-b-2 border-primary/20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                      <category.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-[#252525] mb-2">{category.title}</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-primary">{category.subsections.length} {category.subsections.length === 1 ? 'category' : 'categories'}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{category.subsections.reduce((acc, sub) => acc + sub.items.length, 0)} technologies</span>
                      </div>
                    </div>
                  </div>

                  {/* Subsection Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.subsections.map((subsection, subIndex) => (
                      <motion.div
                        key={subIndex}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "0px" }}
                        transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                        className="glass-card rounded-2xl p-7 hover:shadow-lg hover:border-primary/30 border-2 border-transparent transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/30">
                          <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
                          <h3 className="text-lg font-bold text-[#252525] group-hover:text-primary transition-colors">{subsection.subtitle}</h3>
                        </div>
                        <ul className="space-y-3.5">
                          {subsection.items.map((item, itemIndex) => (
                            <li 
                              key={itemIndex} 
                              className="flex items-start gap-3"
                            >
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
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

        {/* What We Don't Do */}
        <section className="py-24 relative bg-secondary/40">
          <div className="absolute inset-0 bg-checkerboard opacity-20" style={{ contain: 'strict', transform: 'translateZ(0)' }} />
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#252525] mb-4 text-center">
                  When We Say "No"
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                  We intentionally do not offer these services. Narrow focus = higher quality.
                </p>
                
                <ul className="space-y-4">
                  {excludedServices.map((service, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-[#252525]">{service}</span>
                    </li>
                  ))}
                </ul>
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
                Need a Technology Not Listed Here?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team constantly evolves. If your project requires a technology not listed, let's discuss.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact" className="group">
                  Ask About Your Tech Stack
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

export default Technology;

