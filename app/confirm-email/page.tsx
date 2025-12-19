import Container from '@/components/container'
import { Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  return (
    <Container>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-lg border shadow-sm">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
            <p className="text-neutral-600">
              We've sent you a confirmation link. Please check your email and click the link to activate your account.
            </p>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="text-sm text-neutral-700">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Return here and sign in</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-sm text-neutral-600">
            <p>Didn't receive the email?</p>
            <p className="mt-1">Check your spam folder or <Link href="/sign-up" className="text-brand-600 hover:underline">try signing up again</Link></p>
          </div>

          <Link href="/sign-in" className="inline-block w-full px-6 py-3 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium transition-colors">
            Go to Sign In
          </Link>
        </div>
      </div>
    </Container>
  )
}
