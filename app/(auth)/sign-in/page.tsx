import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Sign in — MeatCountry' }

export default function SignInPage() {
  return (
    <div className="py-16">
      <AuthForm mode="sign-in" />
    </div>
  )
}
