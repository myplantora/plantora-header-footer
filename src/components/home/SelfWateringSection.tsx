const HERO = "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT1.webp?v=1786000666";

const STEPS = [
  {
    src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT2.webp?v=1786000666",
    caption: "Fill the Water Reservoir",
    alt: "Water being poured into the reservoir of a self-watering planter",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT3.webp?v=1786000666",
    caption: "Water reaches the soil as needed",
    alt: "Cross-section showing water wicking up from the reservoir into the soil",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/PT4.webp?v=1786000666",
    caption: "Healthy and Happy Plant",
    alt: "A healthy fiddle leaf fig growing in a self-watering planter",
  },
];

export function SelfWateringSection() {
  return (
    <section className="bg-teal-deep text-teal-deep-foreground bg-teal-glow">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
        <img
          src={HERO}
          alt="Self-watering planter cross-section with water reservoir and fiddle leaf fig"
          width={1200}
          height={1000}
          loading="lazy"
          className="h-auto w-full rounded-lg object-contain"
        />

        <div className="text-center lg:text-left">
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            About Self-Watering Planters
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed opacity-85 lg:mx-0">
            Self-watering planters provide consistent moisture, prevent overwatering, and simplify
            care for healthy plant growth.
          </p>

          <h3 className="mt-10 font-serif text-2xl sm:text-3xl">How it works</h3>


          <ol className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
            {STEPS.map((step) => (
              <li key={step.src} className="min-w-0">
                <img
                  src={step.src}
                  alt={step.alt}
                  width={512}
                  height={430}
                  loading="lazy"
                  className="h-auto w-full rounded-lg object-contain"
                />
                <p className="mt-3 text-center text-sm leading-snug opacity-90">
                  {step.caption}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
