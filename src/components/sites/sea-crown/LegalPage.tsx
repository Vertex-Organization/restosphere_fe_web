import './LegalPage.css'
import type { Language } from './siteData'

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
  { title: '1. Company Information', body: "This website is operated by The Sea's Crown Nassaukade B.V., registered with the Dutch Chamber of Commerce under number 81264782, with VAT ID NL81264782B01." },
  { title: '2. Services', body: 'We provide seafood dining and group meal services for family gatherings, celebrations and business occasions.' },
  { title: '3. Orders and Payment', body: 'Orders must be placed at least 24 hours in advance. Payments can be made via bank transfer (IBAN: NL05 INGB 0006 8499 73). All prices are listed in EUR, excluding VAT unless otherwise stated.' },
  { title: '4. Delivery', body: 'Deliveries are made within Amsterdam and surrounding areas. Free delivery is available for orders above €150,- (some areas excluded: 1026–1028, 1035, 1101–1109). Specific delivery times are agreed upon when ordering. We reserve the right to cancel or delay orders due to unforeseen circumstances.' },
  { title: '5. Cancellation and Refunds', body: 'Due to the perishable nature of our products, cancellations must be made at least 24 hours in advance. Refunds are subject to approval and depend on the timing of cancellation.' },
  { title: '6. Liability', body: 'We are not liable for any damages resulting from allergies or misuse of our products. Customers are responsible for providing accurate dietary information.' },
  { title: '7. Complaints', body: <>Complaints must be reported within 24 hours after delivery via {email}. We aim to respond within 2 business days.</> },
  { title: '8. Applicable Law', body: 'Dutch law applies. Any disputes will be handled by the competent court in Amsterdam.' },
]

const privacySectionsVi = [
  { title: '1. Dữ liệu được thu thập', body: 'Chúng tôi thu thập thông tin cá nhân như họ tên, tên công ty, email, số điện thoại và chi tiết đơn hàng qua các biểu mẫu trên website.' },
  { title: '2. Mục đích xử lý', body: 'Thông tin của bạn được sử dụng để xử lý đơn hàng, trả lời câu hỏi và gửi các cập nhật dịch vụ có liên quan.' },
  { title: '3. Chia sẻ dữ liệu', body: 'Chúng tôi không chia sẻ dữ liệu cá nhân với bên thứ ba, trừ khi cần thiết để thực hiện đơn hàng hoặc theo yêu cầu của pháp luật.' },
  { title: '4. Lưu trữ dữ liệu', body: 'Dữ liệu được lưu trữ an toàn và chỉ được giữ lại trong thời gian cần thiết để đáp ứng các mục đích nêu trên.' },
  { title: '5. Cookie', body: 'Chúng tôi sử dụng cookie để cải thiện trải nghiệm và phân tích việc sử dụng website.' },
  { title: '6. Quyền của bạn', body: <>Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu bằng cách liên hệ qua {email}.</> },
]

const termsSectionsVi = [
  { title: '1. Thông tin doanh nghiệp', body: "Website được vận hành bởi The Sea's Crown Nassaukade B.V., đăng ký tại Phòng Thương mại Hà Lan với mã số 81264782 và mã số thuế VAT NL81264782B01." },
  { title: '2. Dịch vụ', body: 'Chúng tôi phục vụ các món hải sản và nhận yêu cầu đặt tiệc cho họp mặt gia đình, liên hoan và các dịp gặp gỡ doanh nghiệp.' },
  { title: '3. Đặt hàng và thanh toán', body: 'Vui lòng đặt hàng trước ít nhất 24 giờ. Thanh toán có thể thực hiện qua chuyển khoản ngân hàng (IBAN: NL05 INGB 0006 8499 73). Giá được niêm yết bằng EUR và chưa bao gồm VAT, trừ khi có ghi chú khác.' },
  { title: '4. Giao hàng', body: 'Chúng tôi giao hàng tại Amsterdam và các khu vực lân cận. Miễn phí giao hàng cho đơn trên 150 € (không áp dụng tại một số khu vực: 1026–1028, 1035, 1101–1109). Thời gian giao được thống nhất khi đặt hàng. Chúng tôi có quyền hủy hoặc hoãn giao hàng trong trường hợp bất khả kháng.' },
  { title: '5. Hủy đơn và hoàn tiền', body: 'Do đặc tính dễ hỏng của thực phẩm, yêu cầu hủy cần được gửi trước ít nhất 24 giờ. Việc hoàn tiền được xem xét tùy theo thời điểm hủy đơn.' },
  { title: '6. Trách nhiệm', body: 'Chúng tôi không chịu trách nhiệm đối với thiệt hại do dị ứng hoặc sử dụng sản phẩm không đúng cách. Khách hàng có trách nhiệm cung cấp thông tin chính xác về chế độ ăn và dị ứng.' },
  { title: '7. Khiếu nại', body: <>Vui lòng gửi khiếu nại trong vòng 24 giờ sau khi nhận hàng qua {email}. Chúng tôi cố gắng phản hồi trong vòng 2 ngày làm việc.</> },
  { title: '8. Luật áp dụng', body: 'Luật Hà Lan được áp dụng. Mọi tranh chấp được giải quyết tại tòa án có thẩm quyền ở Amsterdam.' },
]

export default function LegalPage({ kind, language }: { language: Language; kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'
  const en = language === 'en'
  const sections = isPrivacy ? (en ? privacySections : privacySectionsVi) : (en ? termsSections : termsSectionsVi)
  return <main id="main-content" className="sb-legal-page" lang={language}>
    <div className="sb-legal-content">
      <h1>{isPrivacy ? (en ? 'Privacy Policy' : 'Chính sách bảo mật') : (en ? 'Terms and Conditions' : 'Điều khoản sử dụng')}</h1>
      {isPrivacy && <p className="sb-legal-intro">{en ? 'We are committed to protecting your privacy. This privacy policy explains how we collect and use your personal data.' : 'Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập và sử dụng dữ liệu cá nhân.'}</p>}
      <div className="sb-legal-sections">
        {sections.map(section => <section key={section.title}>
          <h2>{section.title}</h2><p>{section.body}</p>
        </section>)}
        {isPrivacy && <section><h2>{en ? '7. Contact Information' : '7. Thông tin liên hệ'}</h2><address>
          <p>The Sea's Crown Nassaukade B.V.</p><p>Nassaukade 378 H</p><p>1054 AD Amsterdam</p>
          <p className="sb-legal-company-number">{en ? 'KVK Number' : 'Mã đăng ký KVK'}: 81264782</p><p>{en ? 'VAT Number' : 'Mã số thuế VAT'}: NL81264782B01</p><p>Email: {email}</p>
        </address></section>}
      </div>
    </div>
  </main>
}
