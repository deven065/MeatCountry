import AuthForm from '@/components/auth-form'

export const metadata = { title: 'Sign up — MeatCountry' }

export default function SignUpPage() {
  return (
    <div className="py-16">
      <AuthForm mode="sign-up" />
    </div>
  )
}
