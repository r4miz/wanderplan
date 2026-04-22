export default function AdPlaceholder({ variant = "sidebar" }: { variant?: "sidebar" | "footer" }) {
  if (variant === "footer") {
    return (
      <div className="adsense-footer">
        <span className="adsense-sidebar__label">Advertisement</span>
        <span>728 × 90 — AdSense Leaderboard</span>
      </div>
    );
  }
  return (
    <div className="adsense-sidebar">
      <span className="adsense-sidebar__label">Advertisement</span>
      <span>300 × 250</span>
      <span>AdSense Medium Rectangle</span>
    </div>
  );
}
