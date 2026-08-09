import { createFileRoute } from '@tanstack/react-router';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { Footer } from '@/components/layout/Footer';

export const Route = createFileRoute('/faqs')({
  head: () => ({
    meta: [
      { title: 'Frequently Asked Questions | Plantora' },
      { name: 'description', content: 'Find answers to common questions about orders, shipping, payments, returns, and more at Plantora.' }
    ]
  }),
  component: FAQsPage,
});

const faqs = [
  {
    question: "Can I change my billing address?",
    answer: `Mail us at support@myplantora.com or Call us at +1(281) 800-9057 to change your order information. Please note that after your order is shipped you cannot change any details on your order.`
  },
  {
    question: "Can I change my order information?",
    answer: `Mail us at support@myplantora.com or Call us at +1(281) 800-9057 to change your order information. Please note that after your order is shipped you cannot change any details on your order.`
  },
  {
    question: "Can I change the delivery address?",
    answer: `Mail us at support@myplantora.com or Call us at +1(281) 800-9057 to change your order information. Please note that after your order is shipped you cannot change any details on your order.`
  },
  {
    question: "Can I customize the product?",
    answer: `You can email us at support@myplantora.com or call us at +1(281) 800-9057 and your order will be placed as per your choice. Please mention preferable colors, sizes, finish, Bulk Number, Email and other details.`
  },
  {
    question: "Guidelines For Writing Product Reviews",
    answer: `Product reviews on myplantora.com are an optimum way to help fellow customers decide what to buy, and what to avoid.\n\nHere are tips to writing product reviews:\n- It's always better to review a product you have used.\n- Provide a relevant, unbiased product overview.\n- List all the pros and cons of the product. Make sure you write a review that stays consistent even after years.\n- Provide facts to back up your opinion.\n- Do not provide inaccurate information. If you're not sure, research.\n- Be creative but stay on topic.\n- A quick edit and spell check will give you credibility. Also, break reviews into small pointers.`
  },
  {
    question: "How to Place an Order?",
    answer: `Log on to myplantora.com.\n\nKindly include the Product name and quantity, Your Name, Email Address, Contact Number, Complete address along with pincode and the preferred Payment Method.\n\nGuest User — If you don't want to register with us, still you can place your order.\n\nYou can directly add the products in your cart and at checkout you can select Continue as Guest.\n\nIn this case your address and order details would not be saved with us, but you can place your order by using your Full Name, Email id, Contact number and complete address details.`
  },
  {
    question: "How do I make a Bank Transfer?",
    answer: `Bank Transfer is one of the Payment Options available.\n\nBelow are the details of the Bank where you can make a Transfer.\n\nOnce you do the same, you need to call and confirm. You can either make a Cash Deposit or a NEFT Transfer.\n\nAccount Name: Plantora Greenhouse LLC.\nBank Name: Wise International Bank\nAccount No: 9848730989535\nIFSC Code: KKBK0001767\nBranch: 11902 Wilcrest Dr, Houston, TX 77031\nMICR Code: 843850934`
  },
  {
    question: "I do not remember both my login ID and password. How do I get it?",
    answer: `Please share your order number or your registered contact number at support@myplantora.com and request for your login ID & password. Your login credentials will be provided shortly.`
  },
  {
    question: "I forgot my password. Please help.",
    answer: `Click on My Account at the top right corner of the website to access the login window.\n\nClick on Forgot your password link on the bottom right of the login window.\n\nEnter your registered e-mail ID.\n\nInstructions to reset the password will be sent to your registered email.`
  },
  {
    question: "What are the Payment Mode Available?",
    answer: `We accept Online Payments by Debit Card, Credit Card, Net banking, and Bank Transfer.\n\nIf you choose Bank Transfer as the Payment Options, Please call us on +1(281) 800-9057 and confirm the same or send us an email on support@myplantora.com with the payment details.`
  },
  {
    question: "What are the modes of refund available?",
    answer: `If you have made an Online Payment the refund is made to your Credit Card, Debit Card or Net banking account.\n\nFor other forms of Payment like Bank Transfer we make the refund to your Bank Account.\n\nYour details which we require for refund process are Account Holder's Name, Bank Name, Branch Name, Account Number, IFSC Code. Refund of your amount would take 7-10 business days from the date of refund initiation and as per the transaction type.`
  },
  {
    question: "What is the cancellation and refund policies?",
    answer: `Request for cancellation of confirmed order should be made within 2 hours of placing the Orders. All the orders dispatched are in accordance with the customer requirements. Hence it becomes challenging for us to cancel them. In case some of the products ordered are not in stock, we make a full refund for those Products, and the same is credited to your account within 7-10 business Days.`
  },
];

function FAQsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SectionContainer className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl text-primary mb-8 text-center md:text-left">Frequently Asked Questions</h1>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-[#E5E5E5] rounded-xl bg-white p-5 open:bg-[#F8F8F8] transition-colors"
              >
                <summary className="flex cursor-pointer items-center justify-between font-serif text-lg text-primary list-none">
                  {faq.question}
                  <span className="ml-4 text-2xl leading-none text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 whitespace-pre-line text-[#4A4A4A] text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </SectionContainer>
      <Footer />
    </div>
  );
}
