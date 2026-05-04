import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { HeartPulse, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { submitDoctorProfile } from '../lib/api';
import { toast } from 'sonner';

export default function DoctorLicenseUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseDocument) {
      toast.error('Please select a license document.');
      return;
    }

    setLoading(true);
    try {
      await submitDoctorProfile({
        license_document: licenseDocument
      });
      toast.success('Medical license uploaded successfully!');
      setTimeout(() => {
        navigate('/doctor-dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload license');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-foreground mb-2">License Verification</h2>
          <p className="text-muted-foreground">Upload your medical license to complete verification</p>
        </div>

        {/* Progress Bar (Final Step) */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Final Step</span>
            <span className="text-sm text-muted-foreground">100% Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle>Medical License Upload</CardTitle>
              <CardDescription>
                Please upload a clear copy of your valid medical license or degree
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="license">Medical License Document *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Supported formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors bg-slate-50">
                    <input
                      type="file"
                      id="license"
                      name="license"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label htmlFor="license" className="cursor-pointer block">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      {licenseDocument ? (
                        <div>
                          <CheckCircle className="h-8 w-8 text-[#10b981] mx-auto mb-2" />
                          <p className="font-medium text-[#10b981] mb-2">
                            License Selected
                          </p>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{licenseDocument.name}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium mb-2">
                            Click to upload medical license
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Drag and drop files here
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Document Verification</p>
                      <p>Your license will be manually verified by our administrative team. Once verified, you will be able to review and approve medical help requests.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Security Note</h4>
                  <p className="text-sm text-green-800">
                    Your documents are stored securely and are only accessible by authorized verification personnel.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/doctor-dashboard')}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !licenseDocument}
                  className="flex-1 bg-[#10b981] hover:bg-[#10b981]/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Upload
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact support at doctors@lifeaid.org
        </p>
      </div>
    </div>
  );
}
