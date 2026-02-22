"use client";

export function SubscribeButton() {
  async function handleSubscribe() {
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
    >
      Subscribe — Start Free Trial
    </button>
  );
}
