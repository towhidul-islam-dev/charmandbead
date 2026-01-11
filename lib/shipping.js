export const calculateShipping = (city) => {
  if (!city) return 0;
  const DHAKA_ZONES = ["Badda", "Banani", "Gulshan", "Mirpur", /* ... others */];
  const isInside = DHAKA_ZONES.some(zone => 
    city.toLowerCase().includes(zone.toLowerCase()) || city.toLowerCase() === "dhaka"
  );
  return isInside ? 80 : 130;
};