import Link from 'next/link'

export const metadata = {
  title: 'Terms and Conditions - MeatCountry',
  description: 'Terms and Conditions for using MeatCountry services'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <Link href="/" className="text-red-600 hover:text-red-700 text-sm font-medium">
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: December 24, 2025</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to MeatCountry. These Terms and Conditions ("Terms") govern your access to and use of the MeatCountry website and mobile application (collectively, the "Platform"), and the purchase of products offered through the Platform.
            </p>

            <p className="text-gray-700 mb-8">
              By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
              <ul className="space-y-2 text-gray-700">
                <li><strong>1.1.</strong> "We," "Us," "Our," or "MeatCountry" refers to MeatCountry, the operator of this Platform.</li>
                <li><strong>1.2.</strong> "You," "Your," or "Customer" refers to the person accessing or using the Platform or purchasing products.</li>
                <li><strong>1.3.</strong> "Products" refers to meat, poultry, seafood, and related food items offered for sale on the Platform.</li>
                <li><strong>1.4.</strong> "Services" refers to the delivery and other services provided through the Platform.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-3"><strong>2.1.</strong> By creating an account, placing an order, or using our Platform, you confirm that:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into a binding contract</li>
                <li>All information provided by you is accurate and complete</li>
                <li>You agree to comply with these Terms and all applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 mb-3"><strong>3.1.</strong> To place orders, you must create an account by providing accurate and complete information including your name, email address, phone number, and delivery address.</p>
              <p className="text-gray-700 mb-3"><strong>3.2.</strong> You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-gray-700"><strong>3.3.</strong> We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activities.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Product Information and Availability</h2>
              <p className="text-gray-700 mb-3"><strong>4.1.</strong> We strive to provide accurate product descriptions, images, weights, and pricing. However:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Product images are for illustrative purposes only</li>
                <li>Actual products may vary slightly in appearance, weight, and color</li>
                <li>We reserve the right to modify product information without prior notice</li>
              </ul>
              <p className="text-gray-700 mb-3"><strong>4.2.</strong> Product availability is subject to stock and supply chain conditions.</p>
              <p className="text-gray-700"><strong>4.3.</strong> All meat and seafood products sold comply with the Food Safety and Standards Act, 2006, and regulations issued by the Food Safety and Standards Authority of India (FSSAI).</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pricing and Payments</h2>
              <p className="text-gray-700 mb-3"><strong>5.1.</strong> All prices displayed on the Platform are in Indian Rupees (INR) and include applicable taxes unless otherwise stated.</p>
              <p className="text-gray-700 mb-3"><strong>5.2.</strong> We reserve the right to change prices at any time without prior notice.</p>
              <p className="text-gray-700 mb-3"><strong>5.3.</strong> We accept credit cards, debit cards, UPI, net banking, and other secure payment methods.</p>
              <p className="text-gray-700"><strong>5.4.</strong> All payments are processed through secure, PCI-DSS compliant payment gateways.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Delivery and Shipping</h2>
              <p className="text-gray-700 mb-3"><strong>6.1.</strong> We deliver to select pin codes as displayed on the Platform.</p>
              <p className="text-gray-700 mb-3"><strong>6.2.</strong> Estimated delivery times are provided at checkout but are not guaranteed.</p>
              <p className="text-gray-700 mb-3"><strong>6.3.</strong> All products are maintained at 0-4°C throughout the cold chain and delivered in temperature-controlled packaging.</p>
              <p className="text-gray-700"><strong>6.4.</strong> Customers must inspect products immediately upon delivery.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
              <p className="text-gray-700 mb-3"><strong>7.1.</strong> Given the perishable nature of our products, returns are accepted only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Products received are damaged, spoiled, or defective</li>
                <li>Wrong products delivered</li>
                <li>Products do not meet food safety standards</li>
              </ul>
              <p className="text-gray-700 mb-3"><strong>7.2.</strong> Returns must be requested within 24 hours of delivery with photographic evidence.</p>
              <p className="text-gray-700"><strong>7.3.</strong> Approved refunds will be processed within 5-7 business days to the original payment method.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Food Safety and Customer Responsibility</h2>
              <p className="text-gray-700 mb-3"><strong>8.1.</strong> Customers must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-3">
                <li>Store products immediately in refrigeration at 0-4°C</li>
                <li>Consume products within the recommended consumption period</li>
                <li>Follow cooking instructions and food safety guidelines</li>
              </ul>
              <p className="text-gray-700"><strong>8.2.</strong> We are not liable for product quality deterioration or foodborne illness resulting from improper storage, handling, or cooking by the customer.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-3"><strong>9.1.</strong> To the maximum extent permitted by law, our total liability shall not exceed the amount paid for the products in question.</p>
              <p className="text-gray-700"><strong>9.2.</strong> This limitation does not affect any statutory rights that cannot be excluded by law.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 mb-3"><strong>10.1.</strong> These Terms are governed by the laws of India.</p>
              <p className="text-gray-700 mb-3"><strong>10.2.</strong> Any disputes shall be subject to the jurisdiction of courts in India.</p>
              <p className="text-gray-700"><strong>10.3.</strong> Disputes may be referred to arbitration under the Arbitration and Conciliation Act, 1996.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Consumer Rights</h2>
              <p className="text-gray-700">
                Nothing in these Terms affects your statutory rights as a consumer under Indian law, including the Consumer Protection Act, 2019.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-3">For questions or concerns regarding these Terms, please contact us:</p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">MeatCountry Customer Support</p>
                <p className="text-gray-700">Email: support@meatcountry.com</p>
                <p className="text-gray-700">Phone: [Your Phone Number]</p>
              </div>
            </section>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 mt-8">
              <p className="text-gray-700">
                <strong>Acknowledgment:</strong> By using our Platform and placing orders, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              <strong>For the love of meat!</strong>
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              These Terms and Conditions are designed to protect both MeatCountry and our valued customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
