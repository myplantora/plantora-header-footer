import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/returns')({
  component: PlaceholderPage,
});

function PlaceholderPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-20 text-center">
      <h1 className="font-serif text-4xl">Returns & Refunds</h1>
      <p className="mt-4 text-gray-600">This is a placeholder for the Returns & Refunds page.</p>
    </div>
  );
}
