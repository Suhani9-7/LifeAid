import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search, Filter, ArrowLeft, ClipboardList, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { fetchAdminRequests, type MedicalCase } from '../lib/api'

export default function AdminRequests() {
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [urgency, setUrgency] = useState('all')

  const [cases, setCases] = useState<MedicalCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchAdminRequests()
      .then((result) => setCases(result))
      .catch(() => setCases([]))
      .finally(() => setIsLoading(false))
  }, [])

  const handleClearFilters = () => {
    setStatus('all')
    setUrgency('all')
    setSearchQuery('')
  }

  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      const matchesStatus = status === 'all' || caseItem.status === status
      const matchesUrgency = urgency === 'all' || caseItem.urgency === urgency
      
      if (!matchesStatus || !matchesUrgency) return false

      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      return (
        caseItem.patientName.toLowerCase().includes(query) ||
        caseItem.diagnosis.toLowerCase().includes(query) ||
        caseItem.location.toLowerCase().includes(query)
      )
    })
  }, [cases, searchQuery, status, urgency])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin-dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Review Requests</h1>
          </div>
          <p className="text-muted-foreground mt-2">Manage and review all patient medical requests across the system.</p>
        </div>

        <Card className="mb-8 border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search patients..."
                  className="pl-10"
                />
              </div>
              <select
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="approved">Approved</option>
                <option value="funded">Funded</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="flex items-center gap-2">
                <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="border-2 hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg truncate">{caseItem.patientName}</h3>
                          <Badge variant="outline" className="shrink-0">{caseItem.id}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{caseItem.diagnosis}</span>
                          <span>{caseItem.location}</span>
                          <span>Goal: ₹{caseItem.targetAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge className={
                          caseItem.status === 'pending' ? 'bg-orange-500' : 
                          ['verified', 'approved', 'funded'].includes(caseItem.status) ? 'bg-emerald-500' : 'bg-slate-500'
                        }>
                          {caseItem.status.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className={
                          caseItem.urgency === 'critical' ? 'text-destructive' : 
                          caseItem.urgency === 'high' ? 'text-orange-600' : ''
                        }>
                          {caseItem.urgency.toUpperCase()}
                        </Badge>
                        <Link to={`/case/${caseItem.id}`}>
                          <Button variant="outline" size="sm">View Request</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCases.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No medical requests found matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
