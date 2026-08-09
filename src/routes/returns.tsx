import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { Footer } from '@/components/layout/Footer';

export const Route = createFileRoute('/returns')({
  head: () => ({
    meta: [
      { title: 'Returns & Refunds | Plantora' },
      { name: 'description', content: 'Learn about our return policy for plants and non-plant products.' }
    ]
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SectionContainer className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl text-primary mb-8 text-center md:text-left">Returns & Refunds Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-8 text-[#4A4A4A]">
            <section className="bg-[#F8F8F8] p-6 rounded-lg">
              <h2 className="font-serif text-2xl text-primary mb-4">Can you return plants? No.</h2>
              <p className="mb-4">
                Plantora does not accept returns on plants as the poor plants will perish due to both way transit stress. But we do guarantee every plant will arrive at your doorstep in great condition.
              </p>
              <p className="italic">
                Please note that the plant might look a little dull due to transit stress. But be assured that exposure to sunlight and proper watering will revive the plant to its natural healthy state.
              </p>
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
                <li>What if you are not happy with the non-plant product? You can Self Return the item to us within seven days from the delivery date</li>
                <li>We will send a replacement or initiate refund for the products to your source account once we receive the product</li>
                <li>You will bear the shipping charges to return the products.</li>
              </ul>
            </section>

            <ReplacementRequestForm />

            <section className="border-t pt-8">
              <h2 className="font-serif text-xl text-primary mb-2">Return Address:</h2>
              <address className="not-italic text-sm leading-relaxed">
                Plantora Agritech Pvt. Ltd<br />
                11902 Wilcrest Dr<br />
                Houston, TX 77031<br /><br />
                <strong>Telephone:</strong> +1(281) 800-9057<br />
                <strong>Email:</strong> support@myplantora.com
              </address>
            </section>
          </div>
        </div>
      </SectionContainer>
      <Footer />
    </div>
  );
}

