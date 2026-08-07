import { Link } from "@tanstack/react-router";

const DESKTOP_BANNER =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/BannerDesktop.png?v=1785914980";
const MOBILE_BANNER =
  "https://cdn.shopify.com/s/files/1/1014/6267/1653/files/BannerMobile600.png?v=1785915646";

export function BannerSection() {
  return (
    <section className="w-full pt-10 lg:pt-16 pb-10 lg:pb-16">
      <Link
        to="/collections"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {/* Mobile banner: shown below md */}
        <img
          src={MOBILE_BANNER}
          alt="Plantora promotional banner"
          width={600}
          height={0}
          loading="lazy"
          className="block h-auto w-full md:hidden"
        />
        {/* Desktop banner: shown md and above */}
        <img
          src={DESKTOP_BANNER}
          alt="Plantora promotional banner"
          width={1920}
          height={0}
          loading="lazy"
          className="hidden h-auto w-full md:block"
        />
      </Link>
    </section>
  );
}