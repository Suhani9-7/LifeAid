import { useState } from 'react';
import { useNavigate } from 'react-router';
import { HeartPulse, Upload, FileText, CheckCircle, AlertCircle, Award, Building2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { submitDoctorProfile } from '../lib/api';
import { toast } from 'sonner';

export default function DoctorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    hospital: '',
    licenseDocument: null as File | null,
    certificateDocument: null as File | null
  });

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, licenseDocument: e.target.files[0] });
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, certificateDocument: e.target.files[0] });
    }
  };

  const handleNext = () => {
    if (step < 2) {
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

    const licenseNumber = formData.licenseNumber.trim();
    const specialization = formData.specialization.trim();
    const hospital = formData.hospital.trim();

    if (!licenseNumber || !specialization || !formData.yearsOfExperience || !hospital) {
      toast.error('Please complete all required professional information.');
      return;
    }

    setLoading(true);
    try {
      await submitDoctorProfile({
        license_number: licenseNumber,
        specialization,
        hospital_name: hospital,
      });
      toast.success('Professional information saved.');
      navigate('/doctor/upload-license');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = 50; // Professional info is half the process

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">LifeAid</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Doctor Verification</h2>
          <p className="text-muted-foreground">Complete your profile to start verifying medical cases</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step 1 of 2</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Tell us about your medical expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Professional Information */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number *</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="licenseNumber"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="pl-10 bg-input-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select 
                  value={formData.specialization}
                  onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                >
                  <SelectTrigger id="specialization" className="bg-input-background">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="oncology">Oncology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="surgery">General Surgery</SelectItem>
                    <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                    <SelectItem value="emergency">Emergency Medicine</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="Enter years of practice"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="bg-input-background"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital/Clinic Affiliation *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hospital"
                    placeholder="Enter hospital or clinic name"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="pl-10 bg-input-background"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Verification Process</p>
                    <p>After this step, you will be asked to upload your medical license for verification. Your credentials will be reviewed by our team within 24-48 hours.</p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to License Upload
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Questions? Contact us at doctors@lifeaid.org
        </p>
      </div>
    </div>
  );
}
