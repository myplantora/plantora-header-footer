import { createFileRoute } from '@tanstack/react-router';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: "Contact Us | Plantora" },
      { name: "description", content: "Get in touch with Plantora for any plant care questions or order support. Email us at care@myplantora.com." }
    ]
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would call a server function or API
      // For now, we simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <h1 className="font-fraunces text-4xl lg:text-6xl text-[#254838] mb-8">Get in Touch</h1>
          <p className="text-[17px] text-gray-600 mb-12 max-w-md">
            Have a question about a plant or need help with your order? Our team of plant experts is here to help you.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-[#254838]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#254838]">Email Support</h3>
                <a href="mailto:care@myplantora.com" className="text-gray-600 hover:text-accent transition-colors">
                  care@myplantora.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-[#254838]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#254838]">Phone</h3>
                <p className="text-gray-600">+1 (800) PLANTORA</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#254838]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#254838]">Office</h3>
                <p className="text-gray-600">Premium Greenery Hub<br />San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F8F8] p-8 lg:p-12 rounded-[40px] border border-gray-100">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-fraunces text-3xl text-[#254838] mb-4">Message Sent!</h2>
              <p className="text-gray-600">
                Thank you for reaching out. One of our plant experts will get back to you shortly.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-accent font-semibold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                <select
                  id="subject"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white appearance-none"
                >
                  <option>Order Support</option>
                  <option>Plant Care Advice</option>
                  <option>Wholesale Inquiry</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C3754C] text-white font-bold py-5 rounded-2xl hover:bg-[#C3754C]/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
