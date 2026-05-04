import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Shield, Users, TrendingUp, ArrowRight, HeartPulse, Stethoscope, HandHeart, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { fetchPublicStats, type PublicStats } from '../lib/api';

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats>({
    patientsHelped: 2847,
    donationsCollected: 4250000,
    activeCases: 0,
    verifiedDoctors: 342,
  });

  useEffect(() => {
    fetchPublicStats().then(setStats).catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">LifeAid</h1>
                <p className="text-xs text-muted-foreground">Community Health Support</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How it Works</a>
              <Link to="/donor-dashboard">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Donate
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-primary px-4 py-2 rounded-full">
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Verified Healthcare Support Platform</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Together We Can Save Lives
              </h1>
              <p className="text-lg text-muted-foreground">
                LifeAid connects patients in medical emergencies with verified doctors, compassionate donors, 
                and trusted organizations to provide life-saving healthcare support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/role-selection">
                  <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-lg">
                    <HeartPulse className="mr-2 h-5 w-5" />
                    Request Medical Help
                  </Button>
                </Link>
                <Link to="/donor-dashboard">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg">
                    <HandHeart className="mr-2 h-5 w-5" />
                    Donate Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800" 
                alt="Healthcare Support" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Shield className="h-8 w-8 text-[#10b981]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified by</p>
                    <p className="font-bold">Licensed Doctors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{stats.patientsHelped.toLocaleString()}</h3>
              <p className="text-muted-foreground mt-2">Patients Helped</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-[#10b981]" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">₹{(stats.donationsCollected / 1000000).toFixed(1)}M</h3>
              <p className="text-muted-foreground mt-2">Donations Collected</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{stats.activeCases}</h3>
              <p className="text-muted-foreground mt-2">Active Cases</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{stats.verifiedDoctors}</h3>
              <p className="text-muted-foreground mt-2">Verified Doctors</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How LifeAid Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, transparent process to connect those in need with those who can help
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Patient Submits Request</h3>
                <p className="text-sm text-muted-foreground">
                  Patient creates a medical help request with details and uploads necessary medical documents.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-[#10b981]">2</span>
                </div>
                <h3 className="font-bold mb-2">Doctor Verifies Case</h3>
                <p className="text-sm text-muted-foreground">
                  Licensed doctors review medical records and verify the authenticity of the case.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-bold mb-2">Case Approved</h3>
                <p className="text-sm text-muted-foreground">
                  Verified cases are published on the platform and made visible to donors.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-destructive">4</span>
                </div>
                <h3 className="font-bold mb-2">Donors Contribute</h3>
                <p className="text-sm text-muted-foreground">
                  Donors review cases and contribute securely to help patients in need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Can Join */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you need help or want to help others, there's a place for you on LifeAid
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <Link to="/register?role=patient">
              <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartPulse className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Patient</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Need medical assistance? Submit your case for verification.
                  </p>
                  <ArrowRight className="h-5 w-5 mx-auto text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/register?role=doctor">
              <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="h-8 w-8 text-[#10b981]" />
                  </div>
                  <h3 className="font-bold mb-2">Doctor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verify medical cases and help ensure transparency.
                  </p>
                  <ArrowRight className="h-5 w-5 mx-auto text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/register?role=donor">
              <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HandHeart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">Donor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support verified cases and make a difference.
                  </p>
                  <ArrowRight className="h-5 w-5 mx-auto text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/register?role=organization">
              <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold mb-2">Organization</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage campaigns and distribute funds efficiently.
                  </p>
                  <ArrowRight className="h-5 w-5 mx-auto text-primary" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary rounded-lg p-2">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-xl">LifeAid</h3>
              </div>
              <p className="text-sm text-slate-400">
                Connecting patients, doctors, donors, and organizations for verified medical assistance.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/donor-dashboard" className="hover:text-white transition-colors">Donate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: support@lifeaid.org</li>
                <li>Phone: 1-800-LIFE-AID</li>
                <li>Address: 123 Healthcare Ave, Boston, MA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 LifeAid. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
