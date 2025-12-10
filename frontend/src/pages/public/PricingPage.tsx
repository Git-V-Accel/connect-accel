import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Shield } from 'lucide-react';

export default function PricingPage() {
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
              <Link to="/"><Button variant="ghost">Back to Home</Button></Link>
              <Link to="/login"><Button variant="ghost">Log In</Button></Link>
              <Link to="/signup"><Button>Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-5xl mb-4 text-center">Transparent Pricing</h1>
        <p className="text-xl text-gray-600 text-center mb-12">No hidden fees. Quality over lowest price.</p>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl mb-4">How Pricing Works</h2>
          <p className="text-gray-600 mb-4">Connect-Accel adds a service margin to ensure quality curation and support.</p>
          <ul className="space-y-2 text-gray-600">
            <li>• Platform margin: 20-25% (covers admin curation, quality assurance, support)</li>
            <li>• Freelancer withdrawal fee: 2.5%</li>
            <li>• Optional consultation: ₹2,000 (credited if project proceeds)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
