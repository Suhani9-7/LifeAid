import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { HeartPulse, HandHeart, DollarSign, TrendingUp, Settings, LogOut, Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'
import { clearAuthSession, getCurrentUser, getDisplayName } from '../lib/auth'
import { fetchDonationHistory, fetchDonorRequests, type MedicalCase } from '../lib/api'
import NotificationButton from '../components/NotificationButton'

export default function DonorDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = getCurrentUser()

  const loadData = useCallback(() => {
    setIsLoading(true)
    Promise.all([
      fetchDonorRequests().catch(() => []),
      fetchDonationHistory().catch(() => []),
    ])
      .then(([casesData, donationsData]) => {
        setCases(casesData)
        setDonations(donationsData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handleRefresh = () => loadData()
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleRefresh)
    return () => {
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleRefresh)
    }
  }, [loadData])

  const verifiedCases = useMemo(
    () =>
      cases.filter((item) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          item.patientName.toLowerCase().includes(query) ||
          item.diagnosis.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
      }),
    [cases, searchQuery]
  )
  const urgentCases = verifiedCases.filter((c) => c.urgency === 'high' || c.urgency === 'critical')
  const totalDonated = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-primary">LifeAid</h1>
                <p className="text-xs text-muted-foreground">Donor Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <NotificationButton />
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Link to="/" onClick={() => clearAuthSession()}>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back, {getDisplayName(user)}</h2>
          <p className="text-muted-foreground">Thank you for your generosity in helping those in need</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Total Donated</p>{isLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold">₹{totalDonated.toLocaleString()}</h3>}</div><div className="bg-green-100 p-3 rounded-lg"><DollarSign className="h-6 w-6 text-[#10b981]" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Cases Supported</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{donations.length}</h3>}</div><div className="bg-blue-100 p-3 rounded-lg"><HandHeart className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Lives Impacted</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{new Set(donations.map((donation) => donation.caseId)).size}</h3>}</div><div className="bg-purple-100 p-3 rounded-lg"><TrendingUp className="h-6 w-6 text-purple-600" /></div></div></CardContent></Card>
          <Card className="border-2"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Urgent Cases</p>{isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{urgentCases.length}</h3>}</div><div className="bg-red-100 p-3 rounded-lg"><HeartPulse className="h-6 w-6 text-destructive" /></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Cases</TabsTrigger>
            <TabsTrigger value="urgent">Urgent Cases</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, diagnosis, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-5 w-40" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                verifiedCases.map((medicalCase) => (
                  <Card key={medicalCase.id} className="border-2 hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{medicalCase.patientName}</h3>
                          <Badge className="bg-[#10b981]">Verified</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{medicalCase.location}</p>
                        <h4 className="font-semibold text-primary mb-2">{medicalCase.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{medicalCase.story}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">₹{medicalCase.raisedAmount.toLocaleString()} of ₹{medicalCase.targetAmount.toLocaleString()}</span>
                        </div>
                        <Progress value={medicalCase.targetAmount ? (medicalCase.raisedAmount / medicalCase.targetAmount) * 100 : 0} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/case/${medicalCase.id}`} className="flex-1"><Button variant="outline" className="w-full">View Details</Button></Link>
                        <Link to={`/checkout?caseId=${medicalCase.id}`} className="flex-1"><Button className="w-full bg-primary hover:bg-primary/90"><HandHeart className="h-4 w-4 mr-2" />Donate</Button></Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="urgent">
            <Card className="border-2 border-destructive">
              <CardHeader><CardTitle className="text-destructive">Critical & Urgent Cases</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="border-2 border-destructive/10 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="flex gap-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-24" /></div>
                            <Skeleton className="h-5 w-40" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2"><Skeleton className="h-2 w-full" /><Skeleton className="h-4 w-32" /></div>
                          <div className="flex justify-end gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    urgentCases.map((medicalCase) => (
                      <div key={medicalCase.id} className="border-2 border-destructive/20 rounded-lg p-4 bg-red-50/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{medicalCase.patientName}</h3>
                              <Badge variant="destructive" className="bg-destructive">{medicalCase.urgency.toUpperCase()} URGENCY</Badge>
                            </div>
                            <p className="font-semibold text-primary mb-1">{medicalCase.diagnosis}</p>
                            <p className="text-sm text-muted-foreground mb-3">{medicalCase.story}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Progress value={medicalCase.targetAmount ? (medicalCase.raisedAmount / medicalCase.targetAmount) * 100 : 0} className="h-2 mb-2" />
                            <p className="text-sm"><span className="font-bold text-[#10b981]">₹{medicalCase.raisedAmount.toLocaleString()}</span> raised of ₹{medicalCase.targetAmount.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/case/${medicalCase.id}`}><Button variant="outline" size="sm">View Details</Button></Link>
                            <Link to={`/checkout?caseId=${medicalCase.id}`}><Button size="sm" className="bg-destructive hover:bg-destructive/90"><HandHeart className="h-4 w-4 mr-2" />Donate Now</Button></Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-2">
              <CardHeader><CardTitle>Your Donation History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 flex justify-between">
                        <div className="space-y-2">
                          <div className="flex gap-2"><Skeleton className="h-5 w-5" /><Skeleton className="h-5 w-32" /></div>
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-8 w-20 ml-auto" />
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </div>
                      </div>
                    ))
                  ) : (
                    donations.map((donation) => (
                      <div key={donation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <HandHeart className="h-5 w-5 text-[#10b981]" />
                              <h4 className="font-bold">{donation.helpRequest?.patientName}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{donation.helpRequest?.diagnosis}</p>
                            {donation.message && <p className="text-sm italic text-muted-foreground">"{donation.message}"</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#10b981]">₹{Number(donation.amount).toLocaleString('en-IN')}</p>                            <p className="text-xs text-muted-foreground">{new Date(donation.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
