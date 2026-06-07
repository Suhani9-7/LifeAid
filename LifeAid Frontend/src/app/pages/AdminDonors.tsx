import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Users, ArrowLeft, Search, Mail, Phone } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { fetchAdminUsers } from '../lib/api'
import { type AuthUser } from '../lib/auth'
import { toast } from 'sonner'

export default function AdminDonors() {
  const navigate = useNavigate()
  const [donors, setDonors] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDonors()
  }, [])

  const loadDonors = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAdminUsers('donor')
      setDonors(data)
    } catch (error) {
      toast.error('Failed to load donors')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDonors = donors.filter((donor) => {
    const query = searchQuery.toLowerCase()
    return (
      donor.first_name.toLowerCase().includes(query) ||
      donor.last_name.toLowerCase().includes(query) ||
      donor.email.toLowerCase().includes(query) ||
      (donor.phone_number && donor.phone_number.includes(query))
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Manage Donors</h1>
          </div>
          <p className="text-muted-foreground mt-2">View and manage all registered donors in the system.</p>
        </div>

        <Card className="mb-8 border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="border-2 hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">
                            {donor.first_name} {donor.last_name || donor.username}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{donor.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{donor.phone_number || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDonors.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No donors found matching your criteria.</p>
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
