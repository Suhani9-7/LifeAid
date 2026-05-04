import { Link } from 'react-router';
import { HeartPulse, Stethoscope, HandHeart, Building2, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">LifeAid</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Role</h2>
          <p className="text-muted-foreground">Choose how you'd like to participate in our community</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/register?role=patient">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <HeartPulse className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Patient</h3>
                <p className="text-muted-foreground mb-4">
                  Submit a medical help request and get verified assistance from our community of donors and organizations.
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-medium">
                  <span>Request Medical Help</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/register?role=doctor">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-10 w-10 text-[#10b981]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Doctor</h3>
                <p className="text-muted-foreground mb-4">
                  Verify patient medical cases, review documents, and help ensure transparency and authenticity.
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-medium">
                  <span>Verify Cases</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/register?role=donor">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <HandHeart className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Donor</h3>
                <p className="text-muted-foreground mb-4">
                  Browse verified medical cases and contribute securely to help patients in need.
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-medium">
                  <span>Start Donating</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/register?role=organization">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Organization</h3>
                <p className="text-muted-foreground mb-4">
                  Manage donation campaigns, support verified cases, and track fund distribution efficiently.
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-medium">
                  <span>Manage Campaigns</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
