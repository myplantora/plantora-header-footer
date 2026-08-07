import { Droplets, ShieldCheck, Zap } from "lucide-react";

export function SelfWateringSection() {
  const steps = [
    {
      icon: Droplets,
      title: "Smart Reservoir",
      description: "Our pots feature a built-in water reservoir that holds up to 2 weeks of water.",
    },
    {
      icon: Zap,
      title: "Self-Feeding",
      description: "Plants absorb exactly what they need through a natural wicking process.",
    },
    {
      icon: ShieldCheck,
      title: "Worry-Free Care",
      description: "Never overwater or underwater again. Perfect for travelers and busy plant parents.",
    },
  ];

  return (
    <section className="bg-[#F8F8F8] py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
            The Plantora Advantage
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Our premium self-watering system ensures your plants stay perfectly hydrated, 
            so you can enjoy lush greenery without the guesswork.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-shadow group-hover:shadow-md">
                <step.icon className="size-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-xl font-bold text-primary">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[5px]">
          <img
            src="https://cdn.shopify.com/s/files/1/1014/6267/1653/files/HowItWorks_Banner.png?v=1785958543"
            alt="Plantora self-watering system illustration"
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
