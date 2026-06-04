import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { HeartPulse, Upload, FileText, DollarSign, User, Settings, LogOut, Plus, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'
import { fetchPatientRequests, fetchProfile, createPatientRequest, updateProfile, type MedicalCase } from '../lib/api'
import { clearAuthSession, getCurrentUser, getDisplayName, saveAuthSession, getAuthSession } from '../lib/auth'
import NotificationButton from '../components/NotificationButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { toast } from 'sonner'

export default function PatientDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [formData, setFormData] = useState({
    diagnosis: '',
    story: '',
    targetAmount: '',
    category: '',
    location: user?.address || '',
    urgency: 'medium',
    document: null as File | null,
  })
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [newLocation, setNewLocation] = useState(user?.address || '')

  const handleUpdateLocation = async () => {
    try {
      const res = await updateProfile({ address: newLocation })
      if (res.user) {
        setUser(res.user)
        const session = getAuthSession()
        if (session) saveAuthSession({ ...session, user: res.user })
        setIsEditingLocation(false)
        toast.success('Location updated successfully')
      }
    } catch (err) {
      toast.error('Failed to update location')
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [casesRes, profileRes] = await Promise.all([
        fetchPatientRequests().catch(() => []),
        fetchProfile().catch(() => null)
      ])
      
      setCases(casesRes)
      
      if (profileRes) {
        setUser(profileRes)
        setNewLocation(profileRes.address || '')
        const session = getAuthSession()
        if (session) {
          saveAuthSession({ ...session, user: profileRes })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const userCase = cases[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // 1. Update profile address if changed or provided
      if (formData.location && formData.location !== user?.address) {
        const updateRes = await updateProfile({ address: formData.location })
        if (updateRes.user) {
          setUser(updateRes.user)
          const session = getAuthSession()
          if (session) saveAuthSession({ ...session, user: updateRes.user })
        }
      }

      // 2. Create help request
      const payload = new FormData()
      payload.append('title', formData.diagnosis)
      payload.append('description', formData.story)
      payload.append('illness_type', formData.category)
      payload.append('amount_required', formData.targetAmount)
      payload.append('location', formData.location || 'Location not provided')
      payload.append('urgency', formData.urgency)

      const response = await createPatientRequest(payload)
      const requestId = (response as any).id
      
      setFormData({ 
        diagnosis: '', 
        story: '', 
        targetAmount: '', 
        category: '', 
        location: formData.location, 
        urgency: 'medium',
        document: null 
      })
      await loadData()
      toast.success('Medical request submitted successfully')
      navigate(`/patient/upload-docs?request_id=${requestId}`)
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
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {medicalCase.location}</p>
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

          <TabsContent value="new">
            <Card className="border-2">
              <CardHeader><CardTitle>Submit New Medical Help Request</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2"><Label htmlFor="diagnosis">Medical Diagnosis</Label><Input id="diagnosis" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="E.g. Cardiac Surgery" required /></div>
                  <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="E.g. Surgery" required /></div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="location">Your Location</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="E.g. Mumbai, Maharashtra" required /></div>
                  <div className="space-y-2"><Label htmlFor="story">Your Story</Label><Textarea id="story" value={formData.story} onChange={(e) => setFormData({ ...formData, story: e.target.value })} className="min-h-32" placeholder="Tell us about your situation..." required /></div>
                  <div className="space-y-2"><Label htmlFor="targetAmount">Target Amount (INR)</Label><Input id="targetAmount" type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} placeholder="E.g. 500000" required /></div>
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
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Location</Label>
                      {isEditingLocation ? (
                        <div className="flex gap-2">
                          <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="h-8" />
                          <Button size="sm" onClick={handleUpdateLocation}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingLocation(false)}><XCircle className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{user?.address || 'Not provided'}</p>
                          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => {
                            setNewLocation(user?.address || '')
                            setIsEditingLocation(true)
                          }}>Edit</Button>
                        </div>
                      )}
                    </div>
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
