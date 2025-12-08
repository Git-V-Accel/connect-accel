import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="size-5 text-white" />
              </div>
              <span className="text-xl">Connect-Accel</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4">How Connect-Accel Works</h1>
          <p className="text-xl text-gray-600">
            A step-by-step guide to getting your project done right
          </p>
        </div>

        {/* Content from landing page expanded */}
        <div className="space-y-16">
          {/* For Clients Section */}
          <div>
            <h2 className="text-3xl mb-8 text-blue-600">For Clients: Getting Your Project Built</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Submit Your Project</h3>
                    <p className="text-gray-600 mb-4">
                      Start by filling out our project submission form with as much detail as you can provide. 
                      Include your project goals, features you need, preferred tech stack, budget range, and timeline.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Not sure how to scope your project? No problem! Book a free 30-minute consultation call with 
                      one of our expert admins. They'll help you define requirements, suggest the right tech stack, 
                      and estimate realistic timelines and budgets.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Pro tip:</strong> The more details you provide upfront, the faster we can match you 
                        with the right freelancer and start your project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">We Refine the Scope</h3>
                    <p className="text-gray-600 mb-4">
                      Once submitted, an experienced admin reviews your project within 24 hours. They analyze your 
                      requirements, identify potential gaps, and may reach out for clarifications.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Our admins create a detailed project brief that includes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                      <li>Clear feature specifications</li>
                      <li>Recommended tech stack</li>
                      <li>Milestone breakdown</li>
                      <li>Realistic timeline estimate</li>
                      <li>Adjusted budget range (with our service margin transparently included)</li>
                    </ul>
                    <p className="text-gray-600">
                      You'll receive this refined brief for approval before we proceed to the matching phase.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Get Matched with Vetted Freelancers</h3>
                    <p className="text-gray-600 mb-4">
                      Your admin searches our curated freelancer network and invites 5-10 qualified candidates to bid 
                      on your project. All our freelancers are pre-vetted for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                      <li>Technical skills and portfolio quality</li>
                      <li>Communication and professionalism</li>
                      <li>Track record of on-time delivery</li>
                      <li>Positive client reviews</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      Freelancers submit detailed proposals including their approach, timeline, and bid amount. 
                      Your admin reviews all bids, compares them side-by-side, and recommends the best match based on 
                      quality, experience, and budget fit.
                    </p>
                    <p className="text-gray-600">
                      Once the best freelancer is selected, we introduce you and assign the project. You'll receive 
                      the freelancer's profile, past work samples, and a project kickoff plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Track Progress & Pay via Milestones</h3>
                    <p className="text-gray-600 mb-4">
                      Your project is broken down into 3-5 milestones, each with specific deliverables and a payment amount.
                    </p>
                    <p className="text-gray-600 mb-4">
                      <strong>How payments work:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                      <li>You deposit funds into secure escrow before work begins</li>
                      <li>Freelancer completes a milestone and submits deliverables</li>
                      <li>You review within 3 business days</li>
                      <li>If approved, payment is released from escrow to the freelancer</li>
                      <li>If changes needed, you provide feedback and freelancer revises</li>
                    </ol>
                    <p className="text-gray-600 mb-4">
                      Throughout the project, your admin monitors progress, mediates any issues, and ensures both parties 
                      stay on track. You can also communicate directly with your freelancer via our in-platform messaging.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-900">
                        <strong>Your money is protected:</strong> Funds remain in escrow until you approve each milestone. 
                        If there's a dispute, our admin team mediates fairly based on the original requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* For Freelancers Section */}
          <div>
            <h2 className="text-3xl mb-8 text-indigo-600">For Freelancers: Getting Quality Projects</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Create Your Profile</h3>
                    <p className="text-gray-600 mb-4">
                      Build a compelling profile that showcases your expertise:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                      <li>Professional summary and bio</li>
                      <li>Skills with proficiency levels</li>
                      <li>Portfolio projects with screenshots and links</li>
                      <li>Work experience and education</li>
                      <li>Hourly/daily rate range</li>
                      <li>Availability status</li>
                    </ul>
                    <p className="text-gray-600">
                      Our admins review your profile and may reach out with feedback to help you stand out. 
                      A complete, high-quality profile gets you invited to better projects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Get Invited to Relevant Projects</h3>
                    <p className="text-gray-600 mb-4">
                      Unlike other platforms where you compete with hundreds of low-ball bids, we work differently. 
                      Our admins personally review each project and invite only 5-10 qualified freelancers whose skills match the requirements.
                    </p>
                    <p className="text-gray-600 mb-4">
                      You'll receive email and in-app notifications when invited. Each invitation includes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                      <li>Detailed project brief (already refined by admins)</li>
                      <li>Tech stack and requirements</li>
                      <li>Budget range</li>
                      <li>Timeline expectations</li>
                      <li>Client's industry and project goals</li>
                    </ul>
                    <p className="text-gray-600">
                      No more wasting time on poorly defined projects or clients who don't know what they want. 
                      Every project you're invited to has been vetted and scoped by professionals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Submit Competitive Proposals</h3>
                    <p className="text-gray-600 mb-4">
                      Create a proposal that highlights why you're the best fit:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                      <li>Your bid amount and timeline estimate</li>
                      <li>Cover letter explaining your approach</li>
                      <li>Relevant portfolio samples</li>
                      <li>Proposed milestone breakdown</li>
                      <li>Any questions for clarification</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      Admins review all proposals and select the best match based on quality, experience, and value 
                      (not just lowest price). They may negotiate with you on behalf of the client to find a win-win.
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <p className="text-sm text-indigo-900">
                        <strong>Pro tip:</strong> Focus on quality and value, not competing on price. Clients on our 
                        platform value quality delivery over cheap quotes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 size-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-3">Deliver & Get Paid Reliably</h3>
                    <p className="text-gray-600 mb-4">
                      Once assigned, you have a clear path to earning:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                      <li>Work on the first milestone according to the agreed spec</li>
                      <li>Submit your deliverables with notes explaining your work</li>
                      <li>Client reviews (usually within 3 days)</li>
                      <li>Payment released from escrow directly to your wallet</li>
                      <li>Withdraw to your bank account anytime (2-3 business days)</li>
                    </ol>
                    <p className="text-gray-600 mb-4">
                      <strong>Your payment is guaranteed:</strong> Since clients deposit to escrow upfront, you never have to 
                      chase payments. If there's a dispute, our admin team mediates fairly based on the requirements and your deliverables.
                    </p>
                    <p className="text-gray-600">
                      After project completion, clients rate you publicly. High ratings lead to more invitations and the 
                      ability to command premium rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl mb-4">Ready to Experience the Difference?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join Connect-Accel and work with confidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?role=client">
                <Button size="lg" variant="secondary">
                  Post Your Project
                </Button>
              </Link>
              <Link to="/signup?role=freelancer">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                  Join as Freelancer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
