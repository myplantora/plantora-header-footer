import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";

type Result =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; place: string; state: string; days: string };

function daysFromZip(zip: string) {
  const seed = zip.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return seed % 2 === 0 ? "2" : "3";
}

export function DeliveryEstimator() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result>({ status: "idle" });

  async function check(e: React.FormEvent) {
    e.preventDefault();
    const zip = pincode.trim();
    if (!/^\d{5}$/.test(zip)) {
      setResult({ status: "error", message: "Please enter a valid 5-digit US pincode." });
      return;
    }
    setResult({ status: "loading" });
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) {
        setResult({ status: "error", message: "Invalid US pincode. Please enter a valid pincode." });
        return;
      }
      const data = (await res.json()) as {
        places?: Array<{ "place name"?: string; "state abbreviation"?: string }>;
      };
      const place = data?.places?.[0];
      if (!place || !place["place name"]) {
        setResult({ status: "error", message: "Invalid US pincode. Please enter a valid pincode." });
        return;
      }
      setResult({
        status: "success",
        place: place["place name"]!,
        state: place["state abbreviation"] ?? "",
        days: daysFromZip(zip),
      });
    } catch {
      setResult({ status: "error", message: "Couldn’t check delivery right now. Please try again." });
    }
  }

  return (
    <div className="rounded-[5px] border border-primary/15 bg-[#EBEADE] p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Truck className="size-4 text-[#1D4D44]" aria-hidden="true" />
        <span className="font-button text-sm font-bold text-[#1D4D44]">Check delivery</span>
      </div>

      <form onSubmit={check} className="mt-2.5 flex items-center gap-2">
        <label htmlFor="delivery-pincode" className="sr-only">
          Enter your US pincode
        </label>
        <input
          id="delivery-pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 5));
            setResult({ status: "idle" });
          }}
          placeholder="Enter pincode"
          aria-invalid={result.status === "error"}
          className="h-10 flex-1 rounded-[5px] border border-primary/20 bg-background px-3 text-sm text-[#1D4D44] placeholder:text-[#1D4D44]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={result.status === "loading"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-primary px-4 font-button text-sm font-medium text-primary-foreground transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {result.status === "loading" ? <Loader2 className="size-4 animate-spin" /> : null}
          Check
        </button>
      </form>

      <div aria-live="polite" className="mt-2 min-h-5">
        {result.status === "success" ? (
          <p className="text-xs text-[#1D4D44] sm:text-sm">
            Healthy plants will be delivered to{" "}
            <span className="">
              {result.place}
              {result.state ? `, ${result.state}` : ""}
            </span>{" "}
            in {result.days} days
          </p>
        ) : null}
        {result.status === "error" ? (
          <p className="text-xs font-medium text-destructive sm:text-sm">{result.message}</p>
        ) : null}
      </div>
    </div>
  );
}
