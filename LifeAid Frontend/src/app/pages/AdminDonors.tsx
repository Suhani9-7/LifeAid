import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Users, ArrowLeft, Search, Mail, Phone, Building2, Globe, FileText, MapPin, Eye, Loader2, IndianRupee, History, Calendar } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { fetchAdminUsers, fetchAdminUserDetail } from '../lib/api'
import { type AuthUser } from '../lib/auth'
import { toast } from 'sonner'

export default function AdminDonors() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [donors, organizations] = await Promise.all([
        fetchAdminUsers('donor'),
        fetchAdminUsers('organization')
      ])
      setUsers([...donors, ...organizations])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    const name = user.role === 'organization' 
      ? user.organization_profile?.org_name || '' 
      : `${user.first_name} ${user.last_name}`
    
    return (
      name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone_number && user.phone_number.includes(query))
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
            <h1 className="text-3xl font-bold">Manage Donors & Organizations</h1>
          </div>
          <p className="text-muted-foreground mt-2">View and manage registered donors and organizations in the system.</p>
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
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-2 hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${user.role === 'organization' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                              {user.role === 'organization' ? (
                                <Building2 className="h-6 w-6 text-blue-600" />
                              ) : (
                                <Users className="h-6 w-6 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                                {user.role === 'organization' 
                                  ? (user.organization_profile?.org_name || user.username)
                                  : `${user.first_name} ${user.last_name || user.username}`}
                              </h3>
                              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                  {user.role}
                                </span>
                                <span>•</span>
                                <span>@{user.username}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm pt-2">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <Mail className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Email Address</span>
                              <span className="font-medium truncate">{user.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <Phone className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Phone Number</span>
                              <span className="font-medium">{user.phone_number || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No users found matching your criteria.</p>
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
