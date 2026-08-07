import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { helpLinks, shopLinks } from "@/config/navigation";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { PaymentIcons } from "./PaymentIcons";

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
];

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-serif text-xl text-primary-foreground">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="footer-link text-[15px] text-primary-foreground/75 transition-colors duration-300 hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1D4D44] text-primary-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr] lg:gap-10">
          <div className="max-w-md">
            <Logo tone="light" />
            <h2 className="mt-6 font-serif text-3xl leading-tight">Bring Nature Home.</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-primary-foreground/70">
              <p>
                Inspired by the timeless beauty of nature, Plantora was created to help people build
                healthier, greener living spaces across the United States.
              </p>
              <p>
                Whether you're an experienced plant enthusiast or just beginning your plant journey,
                Plantora offers premium indoor and outdoor plants, thoughtfully selected to thrive in
                your home. Every order is backed by expert guidance, careful packaging, and a
                commitment to making plant care simple, enjoyable, and inspiring.
              </p>
              <p>
                At Plantora, every leaf brings life, every plant creates comfort, and every home
                deserves a touch of nature.
              </p>
            </div>
            <ul className="mt-7 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/20 transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                  className="grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/20 text-[13px] font-semibold transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Pi
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/20 text-[13px] font-semibold transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Tk
                </a>
              </li>
            </ul>
          </div>

          <FooterLinks title="Shop" links={shopLinks} />
          <FooterLinks title="Help" links={helpLinks} />

          <div>
            <h3 className="font-serif text-xl text-primary-foreground">Stay Connected</h3>
            <p className="mt-5 font-serif text-2xl leading-snug">Join the Plantora Community</p>
            <p className="mt-3 text-[15px] leading-relaxed text-primary-foreground/70">
              Get plant care tips, exclusive offers, new arrivals, and seasonal inspiration delivered
              straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-5 py-6 text-[13px] text-primary-foreground/70 sm:px-6 lg:flex-row lg:justify-between lg:px-10">
          <p>© 2026 Plantora. All Rights Reserved.</p>
          <p className="text-center">Made with ❤️ for plant lovers across the USA.</p>
          <PaymentIcons />
        </div>
      </div>
    </footer>
  );
}
