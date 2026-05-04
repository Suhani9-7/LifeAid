import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { HeartPulse, CheckCircle, XCircle, FileText, AlertCircle, User, Settings, LogOut, Upload } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Textarea } from '../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'
import { clearAuthSession, getCurrentUser, getDisplayName } from '../lib/auth'
import { fetchDoctorPendingRequests, fetchDoctorVerifiedRequests, type MedicalCase, verifyDoctorRequest } from '../lib/api'
import { toast } from 'sonner'
import NotificationButton from '../components/NotificationButton'

export default function DoctorDashboard() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [pendingCases, setPendingCases] = useState<MedicalCase[]>([])
  const [verifiedCases, setVerifiedCases] = useState<MedicalCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = getCurrentUser()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pending, verified] = await Promise.all([
        fetchDoctorPendingRequests().catch(() => []),
        fetchDoctorVerifiedRequests().catch(() => []),
      ])
      setPendingCases(pending)
      setVerifiedCases(verified)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVerify = async (caseId: string, approved: boolean) => {
    const doctorRemarks = comment.trim()
    if (!doctorRemarks) {
      toast.error('Please add a medical comment before submitting your review.')
      return
    }

    try {
      await verifyDoctorRequest(caseId, approved ? 'approve' : 'reject', doctorRemarks)
      toast.success(approved ? 'Case approved and verified.' : 'Case rejected.')
      setSelectedCase(null)
      setComment('')
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    }
  }

  const handleViewDocuments = (documentUrl?: string) => {
    if (!documentUrl) {
      toast.error('No patient medical document uploaded for this case.')
      return
    }

    const fullUrl = documentUrl.startsWith('http')
      ? documentUrl
      : `${window.location.origin}${documentUrl.startsWith('/') ? documentUrl : `/${documentUrl}`}`
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2"><HeartPulse className="h-6 w-6 text-white" /></div>
              <div><h1 className="font-bold text-primary">LifeAid</h1><p className="text-xs text-muted-foreground">Doctor Dashboard</p></div>
            </Link>
            <div className="flex items-center gap-4">
              {!user?.doctor_profile?.license_document && (
                <Link to="/doctor/upload-license">
                  <Button variant="outline" size="sm" className="bg-blue-50 text-primary border-blue-200 hover:bg-blue-100">
                    <Upload className="h-4 w-4 mr-2" /> Upload License
                  </Button>
                </Link>
              )}
              <NotificationButton />
              <Button variant="ghost" size="sm"><Settings className="h-4 w-4 mr-2" />Settings</Button>
              <Link to="/" onClick={() => clearAuthSession()}><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><LogOut className="h-4 w-4 mr-2" />Logout</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, Dr. {getDisplayName(user)}</h2>
          <p className="text-muted-foreground">Review and verify medical cases to help patients receive support</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{pendingCases.length}</h3>}</div><div className="bg-orange-100 p-3 rounded-lg"><AlertCircle className="h-6 w-6 text-orange-600" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Verified Cases</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{verifiedCases.length}</h3>}</div><div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="h-6 w-6 text-[#10b981]" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Total Reviews</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{pendingCases.length + verifiedCases.length}</h3>}</div><div className="bg-blue-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Lives Impacted</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{verifiedCases.length}</h3>}</div><div className="bg-purple-100 p-3 rounded-lg"><User className="h-6 w-6 text-purple-600" /></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
            <TabsTrigger value="verified">Verified Cases</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-2">
              <CardHeader><CardTitle>Cases Awaiting Verification</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="border-2 rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-48" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-10 w-full mt-4" />
                      </div>
                    ))
                  ) : pendingCases.length === 0 ? (
                    <div className="text-center py-12"><CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No pending cases to review</p></div>
                  ) : (
                    pendingCases.map((medicalCase) => (
                      <div key={medicalCase.id} className="border-2 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{medicalCase.patientName}</h3>
                              <Badge variant="destructive" className={medicalCase.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>{medicalCase.urgency.toUpperCase()} URGENCY</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{medicalCase.location}</p>
                            <h4 className="font-semibold text-primary mb-2">{medicalCase.diagnosis}</h4>
                            <p className="text-sm text-muted-foreground mb-4">{medicalCase.story}</p>
                          </div>
                        </div>
                        {selectedCase === medicalCase.id ? (
                          <div className="mt-4 space-y-4 bg-slate-50 p-4 rounded-lg">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Medical Comment</label>
                              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="bg-white min-h-24" />
                            </div>
                            <div className="flex gap-3">
                              <Button onClick={() => handleVerify(medicalCase.id, true)} className="bg-[#10b981] hover:bg-[#10b981]/90 flex-1"><CheckCircle className="h-4 w-4 mr-2" />Approve & Verify</Button>
                              <Button onClick={() => handleVerify(medicalCase.id, false)} variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                              <Button onClick={() => setSelectedCase(null)} variant="outline">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3 pt-4 border-t">
                            <Button onClick={() => setSelectedCase(medicalCase.id)} className="bg-primary hover:bg-primary/90 flex-1"><FileText className="h-4 w-4 mr-2" />Review Case</Button>
                            <Button onClick={() => handleViewDocuments(medicalCase.documentUrl)} variant="outline" className="flex-1"><FileText className="h-4 w-4 mr-2" />View Documents</Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card className="border-2">
              <CardHeader><CardTitle>Your Verified Cases</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="flex gap-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-16" /></div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-12 ml-auto" />
                            <Skeleton className="h-5 w-20 ml-auto" />
                            <Skeleton className="h-3 w-16 ml-auto" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    verifiedCases.map((medicalCase) => (
                      <div key={medicalCase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2"><h3 className="font-bold">{medicalCase.patientName}</h3><Badge className="bg-[#10b981]"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge></div>
                            <p className="text-sm font-medium text-primary mb-1">{medicalCase.diagnosis}</p>
                            <p className="text-sm text-muted-foreground mb-2">{medicalCase.category}</p>
                            {medicalCase.doctorComment && <div className="bg-green-50 border border-green-200 rounded p-3 mt-2"><p className="text-xs font-medium text-green-900 mb-1">Your Comment:</p><p className="text-sm text-green-800">{medicalCase.doctorComment}</p></div>}
                          </div>
                          <div className="text-right"><p className="text-sm text-muted-foreground mb-1">Raised</p><p className="font-bold text-[#10b981]">₹{medicalCase.raisedAmount.toLocaleString('en-IN')}</p><p className="text-xs text-muted-foreground">of ₹{medicalCase.targetAmount.toLocaleString('en-IN')}</p></div>                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-2">
              <CardHeader><CardTitle>Doctor Profile</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-full"><User className="h-12 w-12 text-[#10b981]" /></div>
                    <div><h3 className="font-bold text-lg">Dr. {getDisplayName(user)}</h3><p className="text-sm text-muted-foreground">{user?.doctor_profile?.specialization || 'Doctor'}</p><Badge className="mt-2 bg-[#10b981]">{user?.doctor_profile?.is_approved ? 'Verified Doctor' : 'Pending Approval'}</Badge></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-sm text-muted-foreground">Email</label><p className="font-medium">{user?.email}</p></div>
                    <div><label className="text-sm text-muted-foreground">License Number</label><p className="font-medium">{user?.doctor_profile?.license_number || 'Not submitted'}</p></div>
                    <div><label className="text-sm text-muted-foreground">Specialization</label><p className="font-medium">{user?.doctor_profile?.specialization || 'Not submitted'}</p></div>
                    <div><label className="text-sm text-muted-foreground">Hospital</label><p className="font-medium">{user?.doctor_profile?.hospital_name || user?.address || 'Not submitted'}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
