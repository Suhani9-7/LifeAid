import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ShieldCheck, UserPlus, ClipboardList, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { fetchAdminRequests, fetchAdminSummary, type MedicalCase } from '../lib/api'
import NotificationButton from '../components/NotificationButton'

export default function AdminDashboard() {
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [summary, setSummary] = useState({ total_users: 0, total_donations: 0 })

  useEffect(() => {
    fetchAdminRequests().then(setCases).catch(() => setCases([]))
    fetchAdminSummary().then(setSummary).catch(() => undefined)
  }, [])

  const pendingCases = cases.filter((item) => item.status === 'pending')
  const verifiedCases = cases.filter((item) => ['verified', 'approved', 'funded'].includes(item.status))

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage users, doctors, requests, and view system impact.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <NotificationButton />
            <Button variant="secondary" className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add user
            </Button>
            <Link to="/admin/doctors">
              <Button className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Manage doctors
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-2">
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Patients helped</p>
              <p className="text-3xl font-bold">{summary.total_users}</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Donations collected</p>
              <p className="text-3xl font-bold">₹{Number(summary.total_donations || 0).toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Active verified requests</p>
              <p className="text-3xl font-bold">{verifiedCases.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending requests</p>
              <p className="text-3xl font-bold">{pendingCases.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Latest requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.slice(0, 4).map((caseItem) => (
                  <div key={caseItem.id} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{caseItem.patientName}</p>
                        <p className="text-sm text-muted-foreground">{caseItem.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{caseItem.location}</p>
                      </div>
                      <Badge className={caseItem.status === 'pending' ? 'bg-orange-500' : 'bg-emerald-500'}>
                        {caseItem.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <p>Urgency: {caseItem.urgency}</p>
                      <Link to={`/case/${caseItem.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/requests" className="block w-full">
                <Button className="w-full inline-flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Review requests
                </Button>
              </Link>
              <Link to="/reports" className="block w-full">
                <Button className="w-full inline-flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
