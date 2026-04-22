"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TIPS = [
  "Did you know? The best local restaurants are often found one street off the main tourist drag.",
  "Tip: Ask your hotel reception for their personal favorite lunch spot.",
  "Fun fact: Most cities have a golden hour neighborhood walk no travel guide mentions.",
  "Tip: Downloading offline maps before you land can save you with patchy data.",
  "Did you know? Many museums are free on the first Sunday of the month.",
  "Tip: The best market experiences happen before 9am — arrive early, beat the crowds.",
  "Fun fact: Street food vendors in the same spot for 20+ years are almost always worth the queue.",
];

export default function LoadingPage() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Researching your destination…");

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const formData = sessionStorage.getItem("pending_form");
    if (!formData) {
      router.push("/");
      return;
    }

    const steps = [
      { text: "Geocoding your address…", delay: 0 },
      { text: "Checking the weather forecast…", delay: 4000 },
      { text: "Finding nearby venues…", delay: 8000 },
      { text: "Generating your itinerary with AI…", delay: 12000 },
      { text: "Almost there…", delay: 35000 },
    ];

    const timers = steps.map(s => setTimeout(() => setStatusText(s.text), s.delay));

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: formData,
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        sessionStorage.removeItem("pending_form");
        sessionStorage.setItem(`itinerary_${data.id}`, JSON.stringify(data));
        router.push(`/itinerary/${data.id}`);
      })
      .catch(err => {
        setError(err.message);
      });

    return () => timers.forEach(clearTimeout);
  }, [router]);

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ fontSize: "3rem" }}>😕</div>
        <h1 className="loading__title" style={{ color: "#FEF2F2" }}>Something went wrong</h1>
        <div className="loading__tip" style={{ background: "rgba(220,53,69,0.15)", color: "#FCA5A5" }}>
          {error}
        </div>
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => router.push("/")}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading__plane">✈️</div>
      <h1 className="loading__title">Building your itinerary…</h1>
      <p className="loading__subtitle">{statusText}</p>
      <div className="loading__progress">
        <div className="loading__progress-bar" />
      </div>
      <div className="loading__tip">💡 {TIPS[tipIndex]}</div>
    </div>
  );
}
