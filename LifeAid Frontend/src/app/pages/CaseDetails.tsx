import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { HeartPulse, ArrowLeft, HandHeart, Share2, Flag, MapPin, Calendar, User, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { fetchPublicRequestDetail, type DonationItem, type MedicalCase } from '../lib/api';
import { getAuthSession, getRoleHomePath } from '../lib/auth';

export default function CaseDetails() {
  const { id } = useParams();
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null);
  const [caseDonations, setCaseDonations] = useState<DonationItem[]>([]);
  const [imageError, setImageError] = useState(false);

  const session = getAuthSession();
  const homePath = getRoleHomePath(session?.user?.role);

  const loadCase = useCallback(() => {
    if (!id) return;
    setImageError(false);
    fetchPublicRequestDetail(id)
      .then((result) => {
        setMedicalCase(result.case);
        setCaseDonations(result.donations);
      })
      .catch(() => {
        setMedicalCase(null);
        setCaseDonations([]);
      });
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  useEffect(() => {
    const handleRefresh = () => loadCase();
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [loadCase]);

  if (!medicalCase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Case not found</p>
        <Link to={homePath}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would process donation
    setShowDonationForm(false);
    setDonationAmount('');
    setDonationMessage('');
  };

  const progressPercentage = Math.round((medicalCase.raisedAmount / medicalCase.targetAmount) * 100);
  const remainingAmount = medicalCase.targetAmount - medicalCase.raisedAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-bold text-primary">LifeAid</h1>
            </Link>
            <Link to={homePath}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              {medicalCase.imageUrl && !imageError ? (
                <img
                  src={medicalCase.imageUrl}
                  alt={medicalCase.patientName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <img
                  src="https://lifechangingcare.com/wp-content/uploads/sites/22/2024/08/Medical-Help.jpg"
                  alt="Medical care placeholder"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-[#10b981] text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                <Badge
                  variant="destructive"
                  className={
                    medicalCase.urgency === 'critical' ? 'bg-destructive' :
                    medicalCase.urgency === 'high' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }
                >
                  {medicalCase.urgency.toUpperCase()} URGENCY
                </Badge>
              </div>
            </div>

            {/* Case Information */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{medicalCase.diagnosis}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{medicalCase.patientName}{medicalCase.patientAge ? `, ${medicalCase.patientAge} years old` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{medicalCase.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(medicalCase.dateCreated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="font-bold text-xl mb-4">Patient's Story</h2>
                  <p className="text-muted-foreground leading-relaxed">{medicalCase.story}</p>
                </div>

                {medicalCase.doctorVerified && medicalCase.doctorComment && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#10b981] p-2 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-green-900 mb-2">
                          Verified by {medicalCase.doctorName}
                        </h3>
                        <p className="text-sm text-green-800 leading-relaxed">
                          {medicalCase.doctorComment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-bold">{medicalCase.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge className="bg-[#10b981]">{medicalCase.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donations */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {caseDonations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No donations yet. Be the first to support!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {caseDonations.map((donation) => (
                      <div key={donation.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-green-100 p-3 rounded-full">
                          <HandHeart className="h-5 w-5 text-[#10b981]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold">{donation.donorName}</h4>
                            <span className="text-lg font-bold text-[#10b981]">
                              ₹{donation.amount.toLocaleString()}
                            </span>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground italic">"{donation.message}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(donation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Progress */}
            <Card className="border-2 sticky top-4">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Raised</span>
                    <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-2" />
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-3xl font-bold text-[#10b981]">
                      ₹{medicalCase.raisedAmount.toLocaleString('en-IN')}
                    </h3>
                    <span className="text-muted-foreground">
                      of ₹{medicalCase.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ₹{remainingAmount.toLocaleString('en-IN')} remaining
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to={`/checkout?caseId=${medicalCase.id}`} className="block w-full">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                    >
                      <HandHeart className="h-5 w-5 mr-2" />
                      Donate Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share This Case
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold mb-3">Donation Impact</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#10b981]" />
                      <span className="text-muted-foreground">100% goes to patient</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#10b981]" />
                      <span className="text-muted-foreground">Tax deductible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#10b981]" />
                      <span className="text-muted-foreground">Secure payment</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report */}
            <Button variant="outline" className="w-full" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report This Case
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
