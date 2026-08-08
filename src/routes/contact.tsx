import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contact')({
  component: PlaceholderPage,
});

function PlaceholderPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-20 text-center">
      <h1 className="font-serif text-4xl">Contact Us</h1>
      <p className="mt-4 text-gray-600">This is a placeholder for the Contact Us page.</p>
    </div>
  );
}
