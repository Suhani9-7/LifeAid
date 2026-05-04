import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { fetchPublicRequestDetail, initiateDonation, verifyDonation, type MedicalCase } from '../lib/api'
import { getCurrentUser } from '../lib/auth'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function DonationCheckout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const caseId = searchParams.get('caseId')
  const user = getCurrentUser()
  const [donationCase, setDonationCase] = useState<MedicalCase | null>(null)

  const [donorName, setDonorName] = useState(user ? `${user.first_name} ${user.last_name}`.trim() : '')
  const [donorEmail, setDonorEmail] = useState(user?.email || '')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetchPublicRequestDetail(caseId)
      .then((result) => setDonationCase(result.case))
      .catch(() => setDonationCase(null))
  }, [caseId])

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!caseId) return

    setIsLoading(true)
    setStatus(null)
    setError(null)

    if (!donorName || !donorEmail || !amount) {
      setError('Please enter name, email, and a donation amount.')
      setIsLoading(false)
      return
    }

    const amountNumber = Number(amount)
    if (isNaN(amountNumber) || amountNumber < 1) {
      setError('Enter a valid donation amount of at least INR 1.')
      setIsLoading(false)
      return
    }

    try {
      const { donation_id, order } = await initiateDonation({
        help_request_id: caseId,
        amount: amountNumber,
        message: message.trim(),
      })

      const isMockOrder = String(order.id || '').startsWith('order_mock_')
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || order.key || ''

      if (isMockOrder || !razorpayKey) {
        setStatus('Processing local test payment...')
        const result = await verifyDonation({
          donation_id,
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        })

        setDonationCase(result.case)
        setStatus('Payment successful! Funding progress updated.')
        setTimeout(() => navigate('/donor-dashboard'), 2000)
        return
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Please check your connection.')
        setIsLoading(false)
        return
      }

      setStatus('Opening Razorpay checkout...')

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'LifeAid',
        description: `Donation for ${donationCase?.patientName || 'medical case'}`,
        image: '/logo.png',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const result = await verifyDonation({
              donation_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            
            setDonationCase(result.case)
            setStatus('Payment successful! Funding progress updated.')
            setTimeout(() => navigate('/donor-dashboard'), 2000)
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed')
            setIsLoading(false)
          }
        },
        prefill: {
          name: donorName,
          email: donorEmail,
        },
        notes: {
          donation_id: donation_id.toString(),
          message: message || '',
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setStatus(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate donation')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Donation Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your donation through Razorpay.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-2">
            <CardHeader><CardTitle>Donation details</CardTitle></CardHeader>
            <CardContent>
              {donationCase ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Recipient</p>
                    <h2 className="text-xl font-semibold">{donationCase.patientName}</h2>
                    <p className="text-sm text-muted-foreground">{donationCase.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">{donationCase.location}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Suggested donation target: <strong>₹{donationCase.targetAmount.toLocaleString('en-IN')}</strong></p>
                  <p className="text-sm text-muted-foreground">Currently raised: <strong>₹{donationCase.raisedAmount.toLocaleString('en-IN')}</strong></p>                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
                  No donation case selected. You can still complete a checkout donation.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader><CardTitle>Payment form</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input required value={donorName} onChange={(event) => setDonorName(event.target.value)} placeholder="Full name" />
                <Input required type="email" value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} placeholder="Email address" />
                <Input required type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Donation amount (INR)" />
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message to the recipient (optional)" rows={4} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Proceed to Razorpay'}
                </Button>
              </form>

              {status && <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">{status}</div>}
              {error && <div className="mt-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-muted-foreground border border-border">
                <p className="font-medium">Integration note:</p>
                <p>This page now loads live case data from Django. To process real payments, set working Razorpay test keys in `lifeaid_backend/.env` and the frontend env.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
