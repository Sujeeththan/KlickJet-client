
export const PLACEHOLDER_SHOP_IMAGES = [
  "https://images.unsplash.com/photo-1540340061722-9293d5163008?q=80&w=871&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=580&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1670684684445-a4504dca0bbc?q=80&w=883&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1655522060985-6769176edff7?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=870&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1664305032567-2c460e29dec1?q=80&w=768&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?q=80&w=464&auto=format&fit=crop"
];

// Helper to get a deterministic random image based on string id
export function getPlaceholderImage(id: string) {
  if (!id) return PLACEHOLDER_SHOP_IMAGES[0];
  const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_SHOP_IMAGES[charCodeSum % PLACEHOLDER_SHOP_IMAGES.length];
}

// Helper to get deterministic random details for a shop
export function getShopRandomDetails(id: string) {
  if (!id) return {
    deliveryTime: "30-45 mins",
    badges: [],
    timing: "08:00 AM - 10:00 PM",
    openHour: 8,
    closeHour: 22
  };

  const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Delivery
  const deliveryTimes = ["15-30 mins", "20-40 mins", "30-45 mins", "45-60 mins", "Within 30 mins"];
  const deliveryTime = deliveryTimes[seed % deliveryTimes.length];
  
  // Badges
  const possibleBadges = [
    { text: "Best Seller", variant: "secondary", className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none" },
    { text: "Offers Available", variant: "outline", className: "border-blue-200 text-blue-600 bg-blue-50/50" },
    { text: "Top Rated", variant: "secondary", className: "bg-green-100 text-green-700 hover:bg-green-200 border-none" },
    { text: "Premium", variant: "outline", className: "border-purple-200 text-purple-600 bg-purple-50/50" }
  ];
  
  const shopBadges = [];
  // Deterministically select badges
  if (seed % 3 === 0) shopBadges.push(possibleBadges[0]);
  if (seed % 2 === 0) shopBadges.push(possibleBadges[1]);
  if (seed % 5 === 0) shopBadges.push(possibleBadges[2]);
  if (shopBadges.length === 0) shopBadges.push(possibleBadges[3]); // Ensure at least one

  // Timings
  const openTimes = [8, 9, 10];
  const closeTimes = [20, 21, 22, 23];
  const openTime = openTimes[seed % openTimes.length];
  const closeTime = closeTimes[seed % closeTimes.length];
  
  const formatTime = (h: number) => {
    const am = h < 12 ? "AM" : "PM";
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:00 ${am}`;
  };
  
  const timing = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  
  return {
    deliveryTime,
    badges: shopBadges.slice(0, 2), // Limit to 2 badges max
    timing,
    openHour: openTime,
    closeHour: closeTime
  };
}

export function isShopOpen(openHour: number, closeHour: number): boolean {
  const currentHour = new Date().getHours();
  return currentHour >= openHour && currentHour < closeHour;
}
