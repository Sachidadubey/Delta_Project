const el = document.getElementById("map-data");
const mapToken = el.dataset.token;
const listing = JSON.parse(el.dataset.listing);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  center: listing.geometry.coordinates,
  zoom: 9
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 })
  .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after Booking</p>`))
  .addTo(map);