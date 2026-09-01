import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { Search } from 'lucide-react';

export const Route = createFileRoute('/track-order')({
  head: () => ({
    meta: [
      { title: 'Track Your Order | Plantora' },
      { name: 'description', content: 'Track your Plantora order by Order ID or AWB number.' }
    ]
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [mode, setMode] = useState<'order' | 'awb'>('order');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    window.open(`https://myplantora.myshopify.com/apps/aftership?${mode === 'order' ? 'order' : 'awb'}=${encodeURIComponent(value.trim())}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <SectionContainer className="py-12 md:py-20">
        <div className="mx-auto w-full max-w-[640px]">
          <div className="rounded-[28px] bg-white px-6 py-10 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center md:h-40 md:w-40">
              <img
                src="https://cdn.shopify.com/s/files/1/0728/9999/7839/files/track-order-illustration.png?v=1700000000"
                alt="Track your order"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <h1 className="font-serif text-center text-[32px] font-bold text-primary md:text-[42px]">
              Track your order
            </h1>

            <div className="mt-8 flex items-center justify-center gap-10">
              <label className="flex cursor-pointer items-center gap-2.5">
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary">
                  {mode === 'order' && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <input
                  type="radio"
                  name="trackMode"
                  value="order"
                  checked={mode === 'order'}
                  onChange={() => setMode('order')}
                  className="sr-only"
                />
                <span className="text-base font-medium text-primary md:text-lg">Order ID</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#C8C8C8]">
                  {mode === 'awb' && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <input
                  type="radio"
                  name="trackMode"
                  value="awb"
                  checked={mode === 'awb'}
                  onChange={() => setMode('awb')}
                  className="sr-only"
                />
                <span className="text-base font-medium text-primary md:text-lg">AWB</span>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter your ${mode === 'order' ? 'Order ID' : 'AWB'}`}
                className="w-full rounded-xl border border-[#D4D4D4] px-5 py-4 text-base text-primary placeholder:text-[#9CA3AF] focus:border-primary focus:outline-none md:text-lg"
              />

              <button
                type="submit"
                className="mt-5 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white transition-opacity hover:opacity-90 md:h-[62px] md:text-lg"
              >
                <Search className="h-5 w-5" />
                Track Order
              </button>
            </form>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
