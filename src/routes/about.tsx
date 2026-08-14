import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: "About Us | Plantora" },
      { name: "description", content: "Learn about Plantora's mission to bring nature home with premium indoor and outdoor plants." }
    ]
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-fraunces text-4xl lg:text-6xl text-[#254838] mb-8">About Plantora</h1>
        
        <div className="space-y-8 text-[17px] leading-relaxed text-gray-700">
          <p className="font-medium text-xl text-[#254838]">
            Inspired by the timeless beauty of nature, Plantora was created to help people build healthier, greener living spaces across the United States.
          </p>
          
          <p>
            We believe that every home deserves a touch of nature. Our journey started with a simple observation: while many people want to bring plants into their lives, the process can often feel intimidating or overwhelming. Plantora was born to bridge that gap.
          </p>

          <div className="bg-[#F8F8F8] p-8 rounded-[30px] border border-gray-100 my-12">
            <h2 className="font-fraunces text-2xl text-[#254838] mb-4">Our Commitment</h2>
            <p>
              Whether you're an experienced plant enthusiast or just beginning your plant journey, Plantora offers premium indoor and outdoor plants, thoughtfully selected to thrive in your home. Every order is backed by expert guidance, careful packaging, and a commitment to making plant care simple, enjoyable, and inspiring.
            </p>
          </div>

          <p>
            At Plantora, every leaf brings life, every plant creates comfort, and every home deserves a touch of nature. We meticulously source our plants from the best growers, ensuring that only the healthiest, most vibrant specimens make it to your doorstep.
          </p>

          <p>
            Our team of plant experts is always here to help you choose the right plant for your space and provide the care tips you need to keep your green friends flourishing for years to come.
          </p>
        </div>
      </div>
    </div>
  );
}
