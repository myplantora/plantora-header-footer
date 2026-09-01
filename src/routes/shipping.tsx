import { createFileRoute, Link } from '@tanstack/react-router';
import { SectionContainer } from '@/components/layout/SectionContainer';

export const Route = createFileRoute('/shipping')({
  head: () => ({
    meta: [
      { title: 'Shipping and Return Policy | Plantora' },
      { name: 'description', content: 'Learn about Plantora\'s shipping rates, delivery times, plant handling, and return policy.' }
    ]
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SectionContainer className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl text-primary mb-8 text-center md:text-left">Shipping and Return Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-8 text-[#4A4A4A]">
            <section>
              <p className="text-lg leading-relaxed">
                Plantora.com ensures quality products and packaging to our customers. We have partnered with reputed courier agencies for a safe and timely delivery. <strong>There is free shipping on orders above USD 99.</strong>
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">How long does it take for an order to arrive?</h2>
              <p>
                All the orders are dispatched from our warehouse within 2 working days. Most of the orders are delivered to your address within 2-6 working days from the date when the order is placed. You can track your order by <Link to="/track-order" className="text-accent underline">clicking here</Link>.
              </p>
            </section>

            <section className="bg-[#F8F8F8] p-6 rounded-lg">
              <h2 className="font-serif text-2xl text-primary mb-4">Live Plant Shipping & Handling</h2>
              <p className="mb-4">
                Plantora does not accept returns on plants as the poor plants will perish due to both way transit stress. But we do guarantee every plant will arrive at your doorstep in great condition.
              </p>
              <p className="mb-4">
                Please note that the plant might look a little dull or yellowish due to transit stress. We recommend placing the plant in direct sunlight for 2 to 3 days to help it recover to its natural healthy state.
              </p>
              <p className="italic">
                Plantora is not responsible for any damage to plants that occurs during shipping. For customers in cold regions, we recommend availing cold protection during shipping to help safeguard live plants from temperature stress.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">Damaged-on-Arrival Replacement</h2>
              <p className="mb-4">
                Live plants are perishable, living goods and are sold as final sale. We do not accept returns, exchanges, cancellations, or refunds for live plants due to change of mind, incorrect selection, or normal transit/handling stress.
              </p>
              <p className="mb-4">
                If a live plant arrives dead or materially damaged, MyPlantora may provide a replacement after reviewing the claim. To qualify:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Record a continuous unboxing video beginning before the package is opened and continuing through the inspection of the plant.</li>
                <li>The damage must be clearly visible in the unboxing video.</li>
                <li>Contact <a href="mailto:care@myplantora.com" className="text-accent underline">care@myplantora.com</a> within 24 hours of delivery.</li>
                <li>Include your MyPlantora order ID, the unboxing video, and clear photographs of the plant and packaging.</li>
                <li>Claims submitted without the required unboxing evidence may not qualify for a replacement.</li>
              </ul>
              <p className="mt-4">
                If approved, MyPlantora will provide a replacement plant rather than a cash refund, subject to availability.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-primary mb-4">If you are worried about the plant health, we have your back. Just contact our support team:</h2>
              <ul className="space-y-2 list-none p-0">
                <li><strong>Email Us:</strong> <a href="mailto:support@myplantora.com" className="text-accent underline">support@myplantora.com</a></li>
                <li><strong>WhatsApp us at:</strong> <a href="https://wa.me/12818009057" className="text-accent underline">+1(281) 800-9057</a></li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">Can you return non-plant products? Yes.</h2>
              <p className="mb-4">
                If any non-plant product reaches you in a damaged state.
              </p>
              <p>
                We take great care selecting the best products for our customers that will help support and enhance your plant life. If you are not happy with your purchase, we will accept returns and exchanges on unused or unopened products within 14 days of purchase. Simply reach out to our customer support team to start the process.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">What if you are not happy with the product? You can Self Return</h2>
              <p className="mb-4">
                If you dislike the product received, you can follow below steps to send the product to us:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Self Return the item to us within seven days from the delivery date</li>
                <li>We will send a replacement or initiate refund for the products to your source account once we receive the product</li>
                <li>You will bear the shipping charges to return the products.</li>
              </ul>
            </section>

            <section className="border-t pt-8">
              <h2 className="font-serif text-xl text-primary mb-2">Return Address:</h2>
              <address className="not-italic text-sm leading-relaxed">
                Plantora Agritech Pvt. Ltd<br />
                11902 Wilcrest Dr<br />
                Houston, TX 77031<br /><br />
                <strong>Telephone:</strong> +1(281) 800-9057
              </address>
            </section>

            <section>
              <p className="text-sm">
                This policy does not limit any rights or remedies that cannot legally be excluded under applicable consumer-protection law.
              </p>
            </section>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
