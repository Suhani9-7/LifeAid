import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { fetchPublicRequests, type MedicalCase } from '../lib/api'

export default function VerifiedRequests() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState('all')

  const [cases, setCases] = useState<MedicalCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categoryOptions = useMemo(
    () => Array.from(new Set(cases.map((caseItem) => caseItem.category))),
    [cases]
  )

  const loadCases = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (category) params.set('illness_type', category)
    if (urgency !== 'all') params.set('urgency', urgency)

    setIsLoading(true)
    fetchPublicRequests(params.toString())
      .then((result) => setCases(result.cases))
      .catch(() => setCases([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadCases()
  }, [location, category, urgency])

  const handleClearFilters = () => {
    setLocation('')
    setCategory('')
    setUrgency('all')
    setSearchQuery('')
  }

  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      // API already filters status and major categories
      // We do client-side search on top
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      return (
        caseItem.patientName.toLowerCase().includes(query) ||
        caseItem.diagnosis.toLowerCase().includes(query) ||
        caseItem.category.toLowerCase().includes(query) ||
        caseItem.location.toLowerCase().includes(query)
      )
    })
  }, [cases, searchQuery])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Verified Requests</h1>
          <p className="text-muted-foreground mt-2">Browse verified donation requests by location, illness, and urgency.</p>
        </div>

        <Card className="mb-8 border-2">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, diagnosis..."
                  className="pl-10"
                />
              </div>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
              />
              <select
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All illnesses</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
              >
                <option value="all">All urgency levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Searching...' : `${filteredCases.length} verified requests found`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="border-2 hover:shadow-xl transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <h2 className="text-xl font-semibold">{caseItem.patientName}</h2>
                            <p className="text-sm text-muted-foreground">{caseItem.location}</p>
                          </div>
                          <Badge
                            className={
                              caseItem.urgency === 'critical'
                                ? 'bg-destructive'
                                : caseItem.urgency === 'high'
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }
                          >
                            {caseItem.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-primary mb-2">{caseItem.diagnosis}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{caseItem.story}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge>{caseItem.category}</Badge>
                      <Badge variant="secondary">Verified</Badge>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Raised</p>
                        <p className="font-semibold">₹{caseItem.raisedAmount.toLocaleString('en-IN')} of ₹{caseItem.targetAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/case/${caseItem.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link to={`/checkout?caseId=${caseItem.id}`}>
                          <Button>Donate Now</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCases.length === 0 && (
                <Card className="border-2 lg:col-span-2">
                  <CardContent className="text-center py-20">
                    <p className="text-muted-foreground">No verified requests match these filters. Try widening the search or removing a filter.</p>
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
