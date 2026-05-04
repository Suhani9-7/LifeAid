import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ShieldCheck, ArrowLeft, Search, UserCheck, UserX, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { fetchAdminUsers, approveUser, type AuthUser, API_BASE_URL } from '../lib/api'
import { toast } from 'sonner'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAdminUsers('doctor')
      setDoctors(data)
    } catch (error) {
      toast.error('Failed to load doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    setProcessingId(id)
    try {
      await approveUser(id)
      toast.success('Doctor approved successfully')
      // Refresh list
      const data = await fetchAdminUsers('doctor')
      setDoctors(data)
    } catch (error) {
      toast.error('Failed to approve doctor')
    } finally {
      setProcessingId(null)
    }
  }

  const handleViewDocument = (documentUrl?: string) => {
    if (!documentUrl || documentUrl === '') {
      toast.error('No medical documents uploaded for this doctor.')
      return
    }
    
    // In development, the backend usually runs on localhost:8000
    // If the URL is already absolute (starts with http), use it directly
    // If relative, prepend the backend origin. Django/Vite proxy will handle the rest.
    let fullUrl = documentUrl
    if (!documentUrl.startsWith('http')) {
      const backendOrigin = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      // Ensure we don't double up on /media/ if the URL already has it
      const cleanPath = documentUrl.startsWith('/') ? documentUrl : `/${documentUrl}`
      fullUrl = `${backendOrigin}${cleanPath}`
    }
      
    console.log('Opening Document:', fullUrl)
    window.open(fullUrl, '_blank')
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchQuery.toLowerCase()
    return (
      doctor.first_name.toLowerCase().includes(query) ||
      doctor.last_name.toLowerCase().includes(query) ||
      doctor.email.toLowerCase().includes(query) ||
      doctor.doctor_profile?.specialization.toLowerCase().includes(query) ||
      doctor.doctor_profile?.hospital_name.toLowerCase().includes(query)
    )
  })

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
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Manage Doctors</h1>
          </div>
          <p className="text-muted-foreground mt-2">Verify medical credentials and manage doctor profiles.</p>
        </div>

        <Card className="mb-8 border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or hospital..."
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
                    <Skeleton className="h-10 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="border-2 hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h3>
                          {doctor.is_verified && doctor.doctor_profile?.is_approved ? (
                            <Badge className="bg-emerald-500">
                              <UserCheck className="h-3 w-3 mr-1" />
                              VERIFIED
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              <UserX className="h-3 w-3 mr-1" />
                              PENDING APPROVAL
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                          <div className="space-y-2">
                            <p><span className="text-muted-foreground">Email:</span> {doctor.email}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {doctor.phone_number}</p>
                            <p><span className="text-muted-foreground">Address:</span> {doctor.address}</p>
                          </div>
                          <div className="space-y-2">
                            <p><span className="text-muted-foreground">Specialization:</span> {doctor.doctor_profile?.specialization}</p>
                            <p><span className="text-muted-foreground">Hospital:</span> {doctor.doctor_profile?.hospital_name}</p>
                            <p><span className="text-muted-foreground">License Number:</span> <code className="bg-slate-100 px-1 rounded">{doctor.doctor_profile?.license_number}</code></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-end gap-2">
                        {(!doctor.is_verified || !doctor.doctor_profile?.is_approved) && (
                          <Button 
                            onClick={() => handleApprove(doctor.id)}
                            disabled={processingId === doctor.id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {processingId === doctor.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-2" />
                            )}
                            Approve Doctor
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => handleViewDocument(doctor.doctor_profile?.license_document)}
                          className={!doctor.doctor_profile?.license_document ? 'text-muted-foreground' : ''}
                        >
                          {doctor.doctor_profile?.license_document ? 'View Documents' : 'No Documents'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDoctors.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No doctors found matching your criteria.</p>
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
