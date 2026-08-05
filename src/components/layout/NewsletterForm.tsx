import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list", {
      description: "Welcome to the Plantora community.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="group flex items-center gap-2 rounded-[20px] border border-primary-foreground/25 bg-primary-foreground/5 p-1.5 transition-colors duration-300 focus-within:border-accent">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[16px] bg-accent px-4 py-2.5 text-[14px] font-medium text-white transition-all duration-300 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
        >
          Subscribe
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-[12px] text-primary-foreground/60">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </form>
  );
}
