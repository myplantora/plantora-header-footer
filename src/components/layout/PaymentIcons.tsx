const marks = [
  "Visa",
  "Mastercard",
  "Amex",
  "Apple Pay",
  "Google Pay",
  "PayPal",
];

export function PaymentIcons() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      {marks.map((mark) => (
        <li
          key={mark}
          className="rounded-lg border border-white/25 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/80"
        >
          {mark}
        </li>
      ))}
    </ul>
  );
}
