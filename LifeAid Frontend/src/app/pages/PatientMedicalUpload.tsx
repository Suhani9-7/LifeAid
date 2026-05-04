import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { HeartPulse, Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { uploadPatientDocument } from '../lib/api';

export default function PatientMedicalUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!requestId) {
      setError('No request ID found. Please create a request first.');
    }
  }, [requestId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) {
      setError('Invalid request. Please go back and try again.');
      return;
    }
    if (files.length === 0) {
      setError('Please select at least one document.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Assuming we upload the first file for now as 'document'
      await uploadPatientDocument(requestId, files[0]);

      setSuccess(true);
      setTimeout(() => {
        navigate('/patient-dashboard');
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setUploading(false);
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Medical Documents</h2>
          <p className="text-muted-foreground">Verify your case with medical reports and bills</p>
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
              <CardTitle>Medical Documentation</CardTitle>
              <CardDescription>
                Upload your medical records, prescriptions, and hospital estimates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-green-100 text-[#10b981] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Upload Successful!</h3>
                  <p className="text-muted-foreground">
                    Your documents have been submitted. Redirecting to your dashboard...
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <Label htmlFor="documents">Upload Medical Documents *</Label>
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors bg-slate-50">
                      <input
                        type="file"
                        id="documents"
                        name="documents"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                      <label htmlFor="documents" className="cursor-pointer block">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          PDF, JPG, PNG, DOC up to 10MB each
                        </p>
                        {files.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-[#10b981] mb-2">
                              {files.length} file(s) selected
                            </p>
                            <div className="space-y-1">
                              {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                  <FileText className="h-4 w-4" />
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">Required Documents</h4>
                      <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                        <li>Doctor's prescription or recommendation</li>
                        <li>Medical test results and reports</li>
                        <li>Hospital estimates or bills</li>
                        <li>Government-issued ID proof</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Document Security</p>
                          <p>All documents are encrypted and stored securely. Only verified doctors reviewing your case will have access.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/patient-dashboard')}
                      className="flex-1"
                    >
                      Skip for now
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploading || files.length === 0}
                      className="flex-1 bg-[#10b981] hover:bg-[#10b981]/90"
                    >
                      {uploading ? (
                        'Uploading...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Upload
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
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
