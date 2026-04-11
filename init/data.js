const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description: "Escape to this charming beachfront cottage...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b" },
    price: 1500,
    location: "Malibu",
    country: "United States",
    category: "Trending",
    geometry: { type: "Point", coordinates: [-118.7798, 34.0259] }
  },
  {
    title: "Modern Loft in Downtown",
    description: "Stay in the heart of the city...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470" },
    price: 1200,
    location: "New York City",
    country: "United States",
    category: "Rooms",
    geometry: { type: "Point", coordinates: [-74.0060, 40.7128] }
  },
  {
    title: "Mountain Retreat",
    description: "Peaceful mountain cabin...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d" },
    price: 1000,
    location: "Aspen",
    country: "United States",
    category: "Mountain",
    geometry: { type: "Point", coordinates: [-106.8175, 39.1911] }
  },
  {
    title: "Historic Villa in Tuscany",
    description: "Explore vineyards and hills...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
    price: 2500,
    location: "Florence",
    country: "Italy",
    category: "Farms",
    geometry: { type: "Point", coordinates: [11.2558, 43.7696] }
  },
  {
    title: "Secluded Treehouse Getaway",
    description: "Treehouse in forest...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4" },
    price: 800,
    location: "Portland",
    country: "United States",
    category: "Camping",
    geometry: { type: "Point", coordinates: [-122.6765, 45.5152] }
  },
  {
    title: "Beachfront Paradise",
    description: "Relax on sandy beach...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9" },
    price: 2000,
    location: "Cancun",
    country: "Mexico",
    category: "Trending",
    geometry: { type: "Point", coordinates: [-86.8515, 21.1619] }
  },
  {
    title: "Rustic Cabin by the Lake",
    description: "Lake side cabin...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" },
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
    category: "Mountain",
    geometry: { type: "Point", coordinates: [-120.0324, 39.0968] }
  },
  {
    title: "Luxury Penthouse",
    description: "City skyline views...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd" },
    price: 3500,
    location: "Los Angeles",
    country: "United States",
    category: "Rooms",
    geometry: { type: "Point", coordinates: [-118.2437, 34.0522] }
  },
  {
    title: "Ski Chalet",
    description: "Swiss Alps stay...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb" },
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
    category: "Mountain",
    geometry: { type: "Point", coordinates: [7.2263, 46.0964] }
  },
  {
    title: "Safari Lodge",
    description: "Wildlife experience...",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e" },
    price: 4000,
    location: "Serengeti",
    country: "Tanzania",
    category: "Camping",
    geometry: { type: "Point", coordinates: [34.6857, -2.3333] }
  },

  // ✅ INDIA DATA (unchanged, already correct)
  {
    title: "Goa Beach Villa",
    description: "Beachside stay",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
    price: 2500,
    location: "Goa",
    country: "India",
    category: "Trending",
    geometry: { type: "Point", coordinates: [73.8278, 15.4909] }
  },
  {
    title: "Manali Mountain Cabin",
    description: "Snow mountain cabin",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470" },
    price: 1800,
    location: "Manali",
    country: "India",
    category: "Mountain",
    geometry: { type: "Point", coordinates: [77.1892, 32.2396] }
  },
  {
    title: "Shimla Hill Stay",
    description: "Hilltop views",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" },
    price: 1600,
    location: "Shimla",
    country: "India",
    category: "Mountain",
    geometry: { type: "Point", coordinates: [77.1734, 31.1048] }
  },
  {
    title: "Jaipur Royal Haveli",
    description: "Royal heritage stay",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b" },
    price: 2200,
    location: "Jaipur",
    country: "India",
    category: "Rooms",
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] }
  },
  {
    title: "Udaipur Lake Palace Stay",
    description: "Lake view stay",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1599661046827-dacde6976549" },
    price: 3000,
    location: "Udaipur",
    country: "India",
    category: "Trending",
    geometry: { type: "Point", coordinates: [73.7125, 24.5854] }
  },
  {
    title: "Rishikesh Camping Site",
    description: "Camping near Ganga",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" },
    price: 1200,
    location: "Rishikesh",
    country: "India",
    category: "Camping",
    geometry: { type: "Point", coordinates: [78.2676, 30.0869] }
  },
  {
    title: "Kerala Backwater Stay",
    description: "Houseboat stay",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470" },
    price: 1700,
    location: "Kerala",
    country: "India",
    category: "Farms",
    geometry: { type: "Point", coordinates: [76.2711, 10.8505] }
  },
  {
    title: "Mumbai Luxury Apartment",
    description: "City apartment",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" },
    price: 3500,
    location: "Mumbai",
    country: "India",
    category: "Rooms",
    geometry: { type: "Point", coordinates: [72.8777, 19.0760] }
  },
  {
    title: "Delhi City Stay",
    description: "Central stay",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
    price: 2000,
    location: "Delhi",
    country: "India",
    category: "Rooms",
    geometry: { type: "Point", coordinates: [77.1025, 28.7041] }
  },
  {
    title: "Ladakh Mountain Camp",
    description: "High altitude camping",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429" },
    price: 2200,
    location: "Ladakh",
    country: "India",
    category: "Camping",
    geometry: { type: "Point", coordinates: [77.5619, 34.1526] }
  }
];

module.exports = { data: sampleListings };