const paymentMethods = [
  { name: "Visa", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Visa.svg?v=1786110000" },
  { name: "Mastercard", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Mastercard.svg?v=1786110001" },
  { name: "Amex", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/Amex.svg?v=1786110002" },
  { name: "Apple Pay", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/ApplePay.svg?v=1786110003" },
  { name: "Google Pay", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/GooglePay.svg?v=1786110004" },
  { name: "PayPal", url: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PayPal.svg?v=1786110005" },
];

export function PaymentIcons() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      {paymentMethods.map((method) => (
        <li
          key={method.name}
          className="flex h-6 w-9 items-center justify-center rounded-sm border border-white/20 bg-white/10 px-1"
        >
          <img
            src={method.url}
            alt={method.name}
            className="h-auto max-h-4 w-auto max-w-full brightness-0 invert"
            onError={(e) => {
              // Fallback if SVG fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerText = method.name.substring(0, 1);
              e.currentTarget.parentElement!.classList.add('text-[8px]', 'font-bold', 'text-white');
            }}
          />
        </li>
      ))}
    </ul>
  );
}
