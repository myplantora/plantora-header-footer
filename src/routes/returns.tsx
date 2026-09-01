import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { Footer } from '@/components/layout/Footer';

export const Route = createFileRoute('/returns')({
  head: () => ({
    meta: [
      { title: 'Returns & Refunds | Plantora' },
      { name: 'description', content: 'Learn about Plantora\'s live plant return, replacement, and refund policy.' }
    ]
  }),
  component: ReturnsPage,
});

function ReplacementRequestForm() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    window.location.href = `mailto:care@myplantora.com?subject=Replacement Request&body=Email/Phone: ${encodeURIComponent(emailOrPhone)}`;
  };

  return (
    <section className="rounded-lg bg-[#F8F8F8] p-6">
      <h2 className="mb-4 font-serif text-2xl text-[#1D4D44]">
        Place a Replacement Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="replacement-email"
            className="mb-1 block text-sm font-medium text-[#1D4D44]"
          >
            Email or Phone
          </label>
          <input
            id="replacement-email"
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Enter the email address used for placing the order"
            className="w-full rounded-lg border border-[#1D4D44]/20 bg-white px-4 py-3 text-sm text-[#1D4D44] placeholder:text-[#1D4D44]/50 focus:border-[#74A84A] focus:outline-none focus:ring-1 focus:ring-[#74A84A]"
          />
        </div>

        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#4A4A4A]">
          <li>
            Record a continuous unboxing video starting before the package is opened and continuing through plant inspection.
          </li>
          <li>
            The damage must be clearly visible in the unboxing video.
          </li>
          <li>
            Contact care@myplantora.com within 24 hours of delivery with your MyPlantora order ID.
          </li>
          <li>
            Attach clear photographs of the plant, packaging, and the unboxing video for review.
          </li>
          <li>
            Claims without the required unboxing evidence may not qualify for a replacement.
          </li>
        </ul>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#74A84A]"
          />
          <span className="text-sm text-[#4A4A4A]">
            By proceeding, you accept our{' '}
            <Link
              to="/terms"
              className="underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              Terms & Conditions
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={!emailOrPhone.trim() || !acceptedTerms}
          className="h-11 w-full rounded-lg bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Request
        </button>
      </form>
    </section>
  );
}

function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SectionContainer className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl text-primary mb-8 text-center md:text-left">Returns & Refunds Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-8 text-[#4A4A4A]">
            <section className="bg-[#F8F8F8] p-6 rounded-lg">
              <h2 className="font-serif text-2xl text-primary mb-4">Live Plant Return & Replacement Policy</h2>
              <p className="mb-4">
                Live plants are perishable, living goods and are therefore sold as final sale. We do not accept returns, exchanges, cancellations, or refunds for live plants due to change of mind, incorrect selection, or normal transit/handling stress.
              </p>
              <p className="mb-4">
                <strong>Damaged-on-arrival exception:</strong> If a live plant arrives dead or materially damaged, MyPlantora may provide a replacement after reviewing the claim.
              </p>
              <p className="italic">
                Please note that the plant might look a little dull or yellowish due to transit stress. We recommend placing the plant in direct sunlight for 2 to 3 days to help it recover to its natural healthy state.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">How to Qualify for a Damaged-Plant Replacement</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>The customer must record a continuous unboxing video beginning before the shipping package is opened and continuing through the inspection of the plant.</li>
                <li>The damage must be clearly visible in the unboxing video.</li>
                <li>The customer must contact <a href="mailto:care@myplantora.com" className="text-accent underline">care@myplantora.com</a> within 24 hours of delivery.</li>
                <li>The email must include the MyPlantora order ID.</li>
                <li>The customer must provide the unboxing video and clear photographs showing the condition of the plant and packaging.</li>
                <li>Claims submitted without the required unboxing evidence may not qualify for a replacement.</li>
              </ul>
              <p className="mt-4">
                If the claim is approved, MyPlantora will provide a replacement plant rather than a cash refund, subject to availability.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">Can you return non-plant products? Yes.</h2>
              <p className="mb-4">
                If any non-plant product reaches you in a damaged state, we will accept returns and exchanges on unused or unopened products within 14 days of purchase. Simply reach out to our customer support team to start the process.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-primary mb-4">What if you are not happy with the product? You can Self Return</h2>
              <p className="mb-4">
                If you dislike the non-plant product received, you can follow the steps below to send the product to us:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Self-return the item to us within seven days from the delivery date.</li>
                <li>We will send a replacement or initiate a refund for the products to your source account once we receive the product.</li>
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

            <section>
              <p className="text-sm">
                This policy does not limit any rights or remedies that cannot legally be excluded under applicable consumer-protection law.
              </p>
            </section>
          </div>
        </div>
      </SectionContainer>
      <Footer />
    </div>
  );
}
