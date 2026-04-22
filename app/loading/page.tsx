"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TIPS = [
  "Did you know? The best local restaurants are often found one street off the main tourist drag.",
  "Tip: Ask your hotel reception for their personal favorite lunch spot — not the tourist one they're paid to recommend.",
  "Fun fact: Most cities have a 'golden hour' neighborhood walk that almost no travel guide mentions.",
  "Tip: Downloading offline maps before you land can save you in spots with patchy data.",
  "Did you know? Many museums are free on the first Sunday of the month.",
  "Tip: The best market experiences happen before 9am — arrive early, beat the crowds.",
  "Fun fact: Street food vendors that have been in the same spot for 20+ years are almost always worth the queue.",
];

export default function LoadingPage() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => router.push("/"), 90000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="loading-screen">
      <div className="loading__plane">✈️</div>
      <h1 className="loading__title">Building your itinerary…</h1>
      <p className="loading__subtitle">
        Our AI is researching your destination, checking the forecast, and crafting a personalized day-by-day plan.
      </p>
      <div className="loading__progress">
        <div className="loading__progress-bar" />
      </div>
      <div className="loading__tip">💡 {TIPS[tipIndex]}</div>
    </div>
  );
}
