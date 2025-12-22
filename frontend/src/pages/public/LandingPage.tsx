import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowRight, CheckCircle, Shield, Users, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="size-5 text-white" />
              </div>
              <span className="text-xl">Connect-Accel</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/how-it-works">
                <Button variant="ghost">How It Works</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl mb-6">
                Software Projects, <br />
                <span className="text-blue-600">Delivered Right</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A managed marketplace where expert admins match your project with vetted freelancers. 
                Get quality, transparency, and peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup?role=client">
                  <Button size="lg" className="w-full sm:w-auto">
                    Post a Project
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link to="/signup?role=freelancer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Find Work
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="size-5" />
                    <span>Human-curated project matching</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="size-5" />
                    <span>Vetted freelancer network</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="size-5" />
                    <span>Milestone-based escrow payments</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="size-5" />
                    <span>Dedicated project oversight</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">How Connect-Accel Works</h2>
            <p className="text-xl text-gray-600">
              The perfect blend of marketplace efficiency and agency quality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Clients */}
            <div>
              <h3 className="text-2xl mb-6 text-blue-600">For Clients</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Submit Your Project</h4>
                    <p className="text-gray-600">Tell us what you need or book a free consultation call</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">We Refine the Scope</h4>
                    <p className="text-gray-600">Our experts clarify requirements and create a detailed brief</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Get Matched</h4>
                    <p className="text-gray-600">We shortlist and assign the perfect freelancer for your needs</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Track & Pay</h4>
                    <p className="text-gray-600">Monitor milestones and release payments safely via escrow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Freelancers */}
            <div>
              <h3 className="text-2xl mb-6 text-indigo-600">For Freelancers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Create Your Profile</h4>
                    <p className="text-gray-600">Showcase your skills, portfolio, and experience</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Get Invited</h4>
                    <p className="text-gray-600">Receive curated project invitations that match your expertise</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Submit Proposals</h4>
                    <p className="text-gray-600">Bid with confidence on well-defined projects</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Deliver & Earn</h4>
                    <p className="text-gray-600">Complete milestones and receive guaranteed payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Why Connect-Accel?</h2>
            <p className="text-xl text-gray-600">
              The best of both worlds: marketplace scale with agency quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="size-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-2">Human Curation</h3>
              <p className="text-gray-600">
                Expert admins review every project and match you with the right talent. No algorithm guesswork.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="size-6 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Vetted Network</h3>
              <p className="text-gray-600">
                Only pre-screened, experienced freelancers. Quality over quantity, every time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="size-6 text-purple-600" />
              </div>
              <h3 className="text-xl mb-2">Milestone Escrow</h3>
              <p className="text-gray-600">
                Funds held securely and released per milestone. Both parties protected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="size-6 text-orange-600" />
              </div>
              <h3 className="text-xl mb-2">Clear Scope</h3>
              <p className="text-gray-600">
                We help refine requirements before bidding starts. No surprises mid-project.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="size-6 text-red-600" />
              </div>
              <h3 className="text-xl mb-2">Dispute Resolution</h3>
              <p className="text-gray-600">
                Fair mediation by experienced admins. Issues resolved quickly and fairly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="size-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="size-6 text-indigo-600" />
              </div>
              <h3 className="text-xl mb-2">Ongoing Support</h3>
              <p className="text-gray-600">
                Direct access to your admin throughout the project lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of successful projects on Connect-Accel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup?role=client">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Post Your Project
              </Button>
            </Link>
            <Link to="/signup?role=freelancer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Join as Freelancer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Shield className="size-6" />
                <span className="text-lg">Connect-Accel</span>
              </div>
              <p className="text-sm">
                Managed freelance marketplace for software projects
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/signup" className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 Connect-Accel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
