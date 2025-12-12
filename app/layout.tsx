import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Container from '@/components/container'
import SupabaseProvider from '@/providers/supabase-provider'

export const metadata = {
  title: 'MeatCountry — Fresh Cuts, Fair Prices',
  description: 'Premium meat and seafood delivered fresh at market pricing in INR.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SupabaseProvider>
          <Navbar />
          <main>
            <Container>{children}</Container>
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  )
}
