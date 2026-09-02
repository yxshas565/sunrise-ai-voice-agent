"use client";

import { FormEvent, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const normalizedPhone = phone.replace(/\s+/g, "");

    if (normalizedPhone.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: normalizedPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create lead");
      }

      const data = await response.json();
      setLeadId(data.lead_id);
    } catch {
      setError(
        "We couldn't connect right now. Please check that the voice service is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (leadId) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-sm font-semibold text-white">
              S
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Sunrise Interiors
            </span>
          </div>

          <div className="hidden text-sm text-[#666] sm:block">
            AI Design Concierge
          </div>
        </nav>

        <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#171717] shadow-xl">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
              </svg>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#777]">
              You&apos;re all set
            </p>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Your design call is
              <br />
              <span className="text-[#777]">being connected.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#666] sm:text-lg">
              Our AI design concierge will call you shortly to understand your
              project and help arrange a conversation with a Sunrise designer.
            </p>

            <div className="mx-auto mt-10 flex max-w-md items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1f1ee]">
                <span className="text-lg">✦</span>
              </div>

              <div>
                <p className="text-sm font-semibold">Lead created</p>
                <p className="mt-1 font-mono text-xs text-[#888]">
                  {leadId.slice(0, 8)}••••
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2 text-xs font-medium text-[#555]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Calling
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f5] text-[#171717]">
      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-sm font-semibold text-white">
            S
          </div>

          <span className="text-lg font-semibold tracking-tight">
            Sunrise Interiors
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-[#666] sm:flex">
          <span>Residential Interiors</span>
          <span>End-to-end Design</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-6 pb-16 pt-8 lg:px-10 lg:pb-24">
        {/* Decorative background */}
        <div className="pointer-events-none absolute right-[-180px] top-[5%] h-[620px] w-[620px] rounded-full border border-black/[0.06]" />
        <div className="pointer-events-none absolute right-[-100px] top-[12%] h-[460px] w-[460px] rounded-full border border-black/[0.05]" />

        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
          {/* Left */}
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              AI design concierge · Available now
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Let&apos;s design a home
              <br />
              <span className="text-[#888]">
                you&apos;ll love coming back to.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-[#666] sm:text-lg">
              Tell us your number and our AI design concierge will call you
              within moments. A quick conversation helps us understand what
              you&apos;re looking for before connecting you with a designer.
            </p>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#555]">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                  ✓
                </span>
                Personalised conversation
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                  ✓
                </span>
                English &amp; Hindi
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                  ✓
                </span>
                Human-like voice
              </div>
            </div>
          </div>

          {/* Lead Card */}
          <div className="relative z-10">
            <div className="rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-9">
              <div className="mb-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999]">
                  Start your consultation
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  Get a call from our AI concierge.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777]">
                  Enter your mobile number. We&apos;ll use it only to start
                  your design consultation.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Mobile number
                </label>

                <div className="flex overflow-hidden rounded-2xl border border-black/10 bg-[#fafaf8] transition focus-within:border-black/30 focus-within:bg-white">
                  <div className="flex items-center border-r border-black/10 px-4 text-sm font-medium text-[#555]">
                    +91
                  </div>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    value={phone.replace(/^\+91/, "")}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, "");
                      setPhone(digits.slice(0, 10));
                      setError("");
                    }}
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-[#aaa]"
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </div>

                {error && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                  className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#171717] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Get my design consultation
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 border-t border-black/[0.07] pt-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f3f0]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>

                  <p className="text-xs leading-5 text-[#888]">
                    By continuing, you&apos;re requesting a call from Sunrise
                    Interiors regarding your interior design enquiry.
                  </p>
                </div>
              </div>
            </div>

            {/* Small product signal */}
            <div className="mt-4 flex items-center justify-between px-2 text-xs text-[#999]">
              <span>Typically connects in moments</span>
              <span className="font-mono">VOICE / AI</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}