import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { HeartPulse, Building2, DollarSign, TrendingUp, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { clearAuthSession, getCurrentUser, getDisplayName } from '../lib/auth';
import { fetchOrgAnalytics, fetchOrgRequests, type MedicalCase } from '../lib/api';
import NotificationButton from '../components/NotificationButton';

export default function OrganizationDashboard() {
  const user = getCurrentUser();
  const [verifiedCases, setVerifiedCases] = useState<MedicalCase[]>([]);
  const [analytics, setAnalytics] = useState({ total_donated: 0, cases_helped: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const activeCases = useMemo(() => verifiedCases.filter(c => c.status === 'verified' || c.status === 'approved'), [verifiedCases]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchOrgRequests().catch(() => []),
      fetchOrgAnalytics().catch(() => ({ total_donated: 0, cases_helped: 0 }))
    ]).then(([cases, analyticsData]) => {
      setVerifiedCases(cases);
      setAnalytics(analyticsData);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-primary">LifeAid</h1>
                <p className="text-xs text-muted-foreground">Organization Dashboard</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{getDisplayName(user)}</h2>
              <p className="text-muted-foreground">Manage your campaigns and support verified medical cases</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Distributed</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-2xl font-bold">₹{Number(analytics.total_donated || 0).toLocaleString('en-IN')}</h3>}
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Cases</p>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{activeCases.length}</h3>}
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cases Helped</p>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{analytics.cases_helped || 0}</h3>}
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verified Cases</p>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <h3 className="text-2xl font-bold">{verifiedCases.length}</h3>}
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <HeartPulse className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases">Support Cases</TabsTrigger>
            <TabsTrigger value="distribution">Fund Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Verified Cases Available for Support</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifiedCases.slice(0, 10).map((medicalCase) => (
                      <div key={medicalCase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{medicalCase.patientName}</h3>
                              <Badge className="bg-emerald-500">Verified</Badge>
                              <Badge variant="outline">{medicalCase.category}</Badge>
                            </div>
                            <p className="text-sm font-medium text-primary mb-2">{medicalCase.diagnosis}</p>
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Target Amount</p>
                                <p className="font-bold">₹{medicalCase.targetAmount.toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Raised</p>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(medicalCase.raisedAmount / medicalCase.targetAmount) * 100}
                                    className="h-2 flex-1"
                                  />
                                  <span className="text-sm font-medium">
                                    {Math.round((medicalCase.raisedAmount / medicalCase.targetAmount) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/case/${medicalCase.id}`}>
                              <Button variant="outline" size="sm">View Case</Button>
                            </Link>
                            <Link to={`/checkout?caseId=${medicalCase.id}`}>
                              <Button size="sm" className="bg-primary hover:bg-primary/90">
                                Support
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {verifiedCases.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No verified cases available at the moment.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Fund Distribution History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Fund distribution history will appear here once donations are made.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
