export default function AffiliateCard({ activity }: { activity: any }) {
  const isRestaurant = activity.type === "restaurant" || activity.affiliate_category === "restaurant";
  const isAttraction = activity.type === "attraction" || activity.affiliate_category === "attraction";
  if (!isRestaurant && !isAttraction) return null;

  const encodedName = encodeURIComponent(activity.name || "");

  return (
    <div className="affiliate-links">
      {isAttraction && (
        <>
          <a href={`https://www.viator.com/search/${encodedName}?pid=P00057212&mcid=42383&medium=link`} target="_blank" rel="noopener noreferrer nofollow" className="affiliate-btn affiliate-btn--viator">
            Book on Viator
          </a>
          <a href={`https://www.getyourguide.com/s/?q=${encodedName}&partner_id=YOUR_GYG_PARTNER_ID`} target="_blank" rel="noopener noreferrer nofollow" className="affiliate-btn affiliate-btn--getyourguide">
            GetYourGuide
          </a>
        </>
      )}
      {isRestaurant && (
        <a href={`https://www.opentable.com/s/?term=${encodedName}`} target="_blank" rel="noopener noreferrer nofollow" className="affiliate-btn affiliate-btn--opentable">
          Reserve on OpenTable
        </a>
      )}
    </div>
  );
}
