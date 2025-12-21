import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t mt-16 bg-neutral-50">
      <div className="container-responsive py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="relative h-12 w-36 mb-2">
              <Image 
                src="/logo.png" 
                alt="MeatCountry" 
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Premium meat and seafood delivered fresh at honest prices. Quality you can trust, delivered to your door.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/meatcountryofficial" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/meatcountryofficial/" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Useful Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={"/about" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">About Us</Link></li>
              <li><Link href="/products" className="text-neutral-600 hover:text-brand-600 transition-colors">Products</Link></li>
              <li><Link href={"/faq" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">FAQ</Link></li>
              <li><Link href={"/blog" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={"/contact" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">Contact Us</Link></li>
              <li><Link href={"/terms" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link href={"/privacy" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href={"/refund" as any} className="text-neutral-600 hover:text-brand-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-neutral-600">
                <Phone className="h-4 w-4 text-brand-600" />
                <span>1800-4190-786</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-4 w-4 text-brand-600" />
                <a href="mailto:support@meatcountry.in" className="hover:text-brand-600 transition-colors">
                  support@meatcountry.in
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-neutral-600">
          <p>&copy; {new Date().getFullYear()} MeatCountry. All rights reserved. | Built with ❤️ for meat lovers</p>
        </div>
      </div>
    </footer>
  )
}
