import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { HeartPulse, Upload, FileText, DollarSign, User, Settings, LogOut, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'
import { clearAuthSession, getCurrentUser, getDisplayName } from '../lib/auth'
import { createPatientRequest, fetchPatientRequests, type MedicalCase } from '../lib/api'
import NotificationButton from '../components/NotificationButton'

export default function PatientDashboard() {
  const [formData, setFormData] = useState({
    diagnosis: '',
    story: '',
    targetAmount: '',
    category: '',
    document: null as File | null,
  })
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const user = getCurrentUser()

  const loadCases = () => {
    setIsLoading(true)
    return fetchPatientRequests()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadCases()
  }, [])

  const userCase = cases[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const payload = new FormData()
    payload.append('title', formData.diagnosis)
    payload.append('description', formData.story)
    payload.append('illness_type', formData.category)
    payload.append('amount_required', formData.targetAmount)
    payload.append('location', user?.address || 'Location not provided')
    payload.append('urgency', 'high')
    if (formData.document) payload.append('document', formData.document)

    try {
      await createPatientRequest(payload)
      setFormData({ diagnosis: '', story: '', targetAmount: '', category: '', document: null })
      await loadCases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2"><HeartPulse className="h-6 w-6 text-white" /></div>
              <div><h1 className="font-bold text-primary">LifeAid</h1><p className="text-xs text-muted-foreground">Patient Dashboard</p></div>
            </Link>
            <div className="flex items-center gap-4">
              <NotificationButton />
              <Button variant="ghost" size="sm"><Settings className="h-4 w-4 mr-2" />Settings</Button>
              <Link to="/" onClick={() => clearAuthSession()}><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><LogOut className="h-4 w-4 mr-2" />Logout</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, {getDisplayName(user)}</h2>
          <p className="text-muted-foreground">Manage your medical help requests and track your donations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Requests</p>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{cases.length}</h3>}
                </div>
                <div className="bg-blue-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Raised</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold">₹{Number(userCase?.raisedAmount || 0).toLocaleString('en-IN')}</h3>}
                </div>
                <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="h-6 w-6 text-[#10b981]" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Request Status</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-lg font-bold">{(userCase?.status || 'pending').toUpperCase()}</h3>}
                </div>
                <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="h-6 w-6 text-[#10b981]" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="border-2">
              <CardHeader><CardTitle>Active Medical Requests</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="border-2 rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-64" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-24" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))
                  ) : cases.length > 0 ? (
                    cases.map((medicalCase) => (
                      <div key={medicalCase.id} className="border-2 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-2">{medicalCase.diagnosis}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              {medicalCase.doctorName && <Badge className="bg-[#10b981] text-white"><CheckCircle className="h-3 w-3 mr-1" />Verified by Dr. {medicalCase.doctorName}</Badge>}
                              <Badge variant="destructive" className={medicalCase.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>{medicalCase.urgency.toUpperCase()}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!medicalCase.imageUrl && (
                              <Link to={`/patient/upload-docs?request_id=${medicalCase.id}`}>
                                <Button variant="secondary" size="sm" className="bg-blue-50 text-primary hover:bg-blue-100 border-blue-200">
                                  <Upload className="h-3 w-3 mr-1" /> Upload Docs
                                </Button>
                              </Link>
                            )}
                            <Link to={`/case/${medicalCase.id}`}><Button variant="outline" size="sm">View Details</Button></Link>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{medicalCase.story}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">₹{medicalCase.raisedAmount.toLocaleString('en-IN')} of ₹{medicalCase.targetAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <Progress value={medicalCase.targetAmount ? (medicalCase.raisedAmount / medicalCase.targetAmount) * 100 : 0} className="h-3" />
                        </div>
                        {medicalCase.doctorComment && <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4"><p className="text-sm font-medium text-green-900 mb-1">Doctor's Comment:</p><p className="text-sm text-green-800">{medicalCase.doctorComment}</p></div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">You haven't submitted any requests yet.</p>
                      <Button variant="outline" className="mt-4" onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
                        Create your first request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* ... existing TabsContent for new and profile ... */}

          <TabsContent value="new">
            <Card className="border-2">
              <CardHeader><CardTitle>Submit New Medical Help Request</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2"><Label htmlFor="diagnosis">Medical Diagnosis</Label><Input id="diagnosis" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="story">Your Story</Label><Textarea id="story" value={formData.story} onChange={(e) => setFormData({ ...formData, story: e.target.value })} className="min-h-32" required /></div>
                  <div className="space-y-2"><Label htmlFor="targetAmount">Target Amount</Label><Input id="targetAmount" type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="documents">Medical Documents</Label><Input id="documents" name="documents" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })} /></div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><p className="text-sm text-blue-900"><AlertCircle className="h-4 w-4 inline mr-2" />Your request will be reviewed by verified doctors before being published to donors.</p></div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Submit Request</Button>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-2">
              <CardHeader><CardTitle>Profile & Health Records</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full"><User className="h-12 w-12 text-primary" /></div>
                    <div><h3 className="font-bold text-lg">{getDisplayName(user)}</h3><p className="text-sm text-muted-foreground">{user?.email}</p></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{user?.email}</p></div>
                    <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{user?.phone_number || 'Not provided'}</p></div>
                    <div><Label className="text-muted-foreground">Location</Label><p className="font-medium">{user?.address || 'Not provided'}</p></div>
                    <div><Label className="text-muted-foreground">Verification</Label><p className="font-medium">{user?.is_verified ? 'Verified' : 'Pending'}</p></div>
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
