import './LegalPage.css'

const email = <a href="mailto:orders@thesandwichbar.nl">orders@thesandwichbar.nl</a>

const privacySections = [
  { title: '1. Data We Collect', body: 'We collect personal data such as name, company name, email, phone number, and order details via forms on our website.' },
  { title: '2. Purpose of Processing', body: 'We use your data to process orders, respond to inquiries, and send relevant service updates.' },
  { title: '3. Data Sharing', body: 'We do not share your personal data with third parties, except where required for order fulfillment or by law.' },
  { title: '4. Data Storage', body: 'Your data is securely stored and retained only as long as necessary for the purposes above.' },
  { title: '5. Cookies', body: 'We use cookies to enhance your experience and analyze website usage.' },
  { title: '6. Your Rights', body: <>You may request access to, correction, or deletion of your data by contacting us at {email}.</> },
]

const termsSections = [
  { title: '1. Company Information', body: 'This website is operated by The Sandwich Bar Nassaukade B.V., registered with the Dutch Chamber of Commerce under number 81264782, with VAT ID NL81264782B01.' },
  { title: '2. Services', body: 'We provide catering services to businesses, including but not limited to lunches, buffets, and event catering.' },
  { title: '3. Orders and Payment', body: 'Orders must be placed at least 24 hours in advance. Payments can be made via bank transfer (IBAN: NL05 INGB 0006 8499 73). All prices are listed in EUR, excluding VAT unless otherwise stated.' },
  { title: '4. Delivery', body: 'Deliveries are made within Amsterdam and surrounding areas. Free delivery is available for orders above €150,- (some areas excluded: 1026–1028, 1035, 1101–1109). Specific delivery times are agreed upon when ordering. We reserve the right to cancel or delay orders due to unforeseen circumstances.' },
  { title: '5. Cancellation and Refunds', body: 'Due to the perishable nature of our products, cancellations must be made at least 24 hours in advance. Refunds are subject to approval and depend on the timing of cancellation.' },
  { title: '6. Liability', body: 'We are not liable for any damages resulting from allergies or misuse of our products. Customers are responsible for providing accurate dietary information.' },
  { title: '7. Complaints', body: <>Complaints must be reported within 24 hours after delivery via {email}. We aim to respond within 2 business days.</> },
  { title: '8. Applicable Law', body: 'Dutch law applies. Any disputes will be handled by the competent court in Amsterdam.' },
]

// Both language variants of the source publish these legal pages in English.
export default function LegalPage({ kind }: { language: 'nl' | 'en'; kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'
  return <main id="main-content" className="sb-legal-page" lang="en">
    <div className="sb-legal-content">
      <h1>{isPrivacy ? 'Privacy Policy' : 'Terms and Conditions'}</h1>
      {isPrivacy && <p className="sb-legal-intro">We are committed to protecting your privacy. This privacy policy explains how we collect and use your personal data.</p>}
      <div className="sb-legal-sections">
        {(isPrivacy ? privacySections : termsSections).map(section => <section key={section.title}>
          <h2>{section.title}</h2><p>{section.body}</p>
        </section>)}
        {isPrivacy && <section><h2>7. Contact Information</h2><address>
          <p>The Sandwich Bar Nassaukade B.V.</p><p>Nassaukade 378 H</p><p>1054 AD Amsterdam</p>
          <p className="sb-legal-company-number">KVK Number: 81264782</p><p>VAT Number: NL81264782B01</p><p>Email: {email}</p>
        </address></section>}
      </div>
    </div>
  </main>
}
