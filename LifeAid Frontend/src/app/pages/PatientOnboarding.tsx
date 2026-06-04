import { useState } from 'react';
import { useNavigate } from 'react-router';
import { HeartPulse, Upload, FileText, DollarSign, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { createPatientRequest, updateProfile } from '../lib/api';
import { getCurrentUser, getAuthSession, saveAuthSession } from '../lib/auth';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    diagnosis: '',
    description: '',
    location: '',
    targetAmount: '',
    category: '',
    urgency: 'medium',
    medicalDocuments: [] as File[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, medicalDocuments: Array.from(e.target.files) });
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      handleNext();
      return;
    }

    const user = getCurrentUser();
    
    try {
      // 1. Update user profile with location
      if (formData.location) {
        const updateRes = await updateProfile({ address: formData.location });
        const session = getAuthSession();
        if (session && updateRes.user) {
          saveAuthSession({ ...session, user: updateRes.user });
        }
      }

      // 2. Create help request
      const payload = new FormData();
      payload.append('title', formData.diagnosis);
      payload.append('description', formData.description);
      payload.append('illness_type', formData.category);
      payload.append('amount_required', formData.targetAmount);
      payload.append('location', formData.location || 'Location not provided');
      payload.append('urgency', formData.urgency);
      if (formData.medicalDocuments.length > 0) {
        payload.append('document', formData.medicalDocuments[0]);
      }
      
      const response = await createPatientRequest(payload);
      const requestId = (response as any).id;
      navigate(`/patient/upload-docs?request_id=${requestId}`);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const progressPercentage = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">LifeAid</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground">Help us understand your medical needs</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 2</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Medical Information'}
                {step === 2 && 'Financial Details'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Tell us about your medical condition'}
                {step === 2 && 'Specify the amount you need for treatment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Medical Information */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Medical Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      placeholder="E.g., Cardiac Surgery, Cancer Treatment, Kidney Transplant"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="bg-input-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="E.g., Surgery, Treatment, Emergency, Therapy"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-input-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level *</Label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Your Location *</Label>
                    <Input
                      id="location"
                      placeholder="E.g., Mumbai, Maharashtra or City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-input-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Medical Condition Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your medical condition, symptoms, and why you need help..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-input-background min-h-32"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Be as detailed as possible to help doctors verify your case
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Important</p>
                        <p>Your case will be reviewed and verified by licensed doctors before being published to donors.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Financial Details */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount Required (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="targetAmount"
                        type="number"
                        placeholder="Enter the amount needed for treatment"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        className="pl-10 bg-input-background"
                        min="1000"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">What to Include in Your Target Amount</h4>
                    <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                      <li>Hospital and surgery fees</li>
                      <li>Doctor consultation charges</li>
                      <li>Medication and treatment costs</li>
                      <li>Post-operative care expenses</li>
                      <li>Medical equipment or supplies</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Fund Transparency</p>
                        <p>100% of donations will go directly to your medical treatment. All fund usage will be verified and tracked.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Average Treatment Cost</p>
                      <p className="text-2xl font-bold text-primary">₹45,000</p>
                      <p className="text-xs text-muted-foreground mt-1">For similar cases</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Average Funding Time</p>
                      <p className="text-2xl font-bold text-[#10b981]">14 Days</p>
                      <p className="text-xs text-muted-foreground mt-1">After verification</p>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {step === 1 ? 'Continue' : 'Continue to Document Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact support at support@lifeaid.org
        </p>
      </div>
    </div>
  );
}
