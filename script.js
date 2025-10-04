// Calls API for map tiler
const API_key_Map = CONFIG.MAPTILER_API_KEY;

const map = new maplibregl.Map({
  // Sets up map
  container: "map",
  style: `https://api.maptiler.com/maps/darkmatter/style.json?key=${API_key_Map}`,
  center: [-100, 40], // [lon, lat]
  zoom: 4,
  projection: "globe",
});

// Global variables to store data and current disaster type
let globalData = null;
let currentDisasterType = null;

document.getElementById("donate").addEventListener("click", () => {
  // Link to goFundMe
  window.open("https://www.gofundme.com/s?q=Natural+Disasters", "_blank");
});

const yearSearchData = document.getElementById("yearSearch");
document.getElementById("searchBtn").addEventListener("click", function () {
  const year = parseInt(yearSearchData.value);
  if (year >= 1980 && year <= 2025) {
    if (globalData && currentDisasterType) {
      disasters(globalData, currentDisasterType, yearSearchData.value);
    } else {
      alert("Please select a disaster type first");
    }
  } else {
    alert("Year not within range of 1980 - 2025");
  }
});

const ListOfMarkers = [];

// Calls API for nasa DataBase
fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=all")
  .then((response) => response.json())
  .then((data) => {
    globalData = data; // Store data globally

    const fireButton = document.getElementById("wildfire-link");
    fireButton.addEventListener("click", () => {
      currentDisasterType = "Wildfires";
      disasters(data, "Wildfires", yearSearchData.value);
    });
    const IceButton = document.getElementById("ice-link");
    IceButton.addEventListener("click", () => {
      currentDisasterType = "Sea and Lake Ice";
      disasters(data, "Sea and Lake Ice", yearSearchData.value);
    });
    const VolcanoButton = document.getElementById("volcano-link");
    VolcanoButton.addEventListener("click", () => {
      currentDisasterType = "Volcanoes";
      disasters(data, "Volcanoes", yearSearchData.value);
    });
    const FloodButton = document.getElementById("flood-link");
    FloodButton.addEventListener("click", () => {
      currentDisasterType = "Floods";
      disasters(data, "Floods", yearSearchData.value);
    });
    const StormButton = document.getElementById("storm-link");
    StormButton.addEventListener("click", () => {
      currentDisasterType = "Severe Storms";
      disasters(data, "Severe Storms", yearSearchData.value);
    });
    const SnowButton = document.getElementById("snow-link");
    SnowButton.addEventListener("click", () => {
      currentDisasterType = "Snow";
      disasters(data, "Snow", yearSearchData.value);
    });
    const QuakeButton = document.getElementById("quake-link");
    QuakeButton.addEventListener("click", () => {
      currentDisasterType = "Earthquakes";
      disasters(data, "Earthquakes", yearSearchData.value);
    });

    data.events.forEach((event) => {
      const coords = event.geometry[0].coordinates;
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

async function disasters(data, nameOfDisaster, yearSearchData) {
  ListOfMarkers.forEach(
    (marker) => (marker.getElement().style.display = "none")
  );
  const disaster = data.events.filter(
    (event) =>
      event.categories.some((cat) => cat.title === nameOfDisaster) &&
      new Date(event.geometry[0].date).getFullYear().toString() ==
        yearSearchData
  );

  if (disaster.length === 0) {
    const center = map.getCenter();

    const NoDataPopup = new maplibregl.Popup({
      // Info on each Disaster
      closeButton: true,
      closeOnClick: true,
    })
      .setLngLat([center.lng, center.lat])
      .setHTML(
        `<strong>No ${nameOfDisaster} events</strong><br>found for ${yearSearchData}.`
      )
      .addTo(map);
  }

  disaster.forEach((event) => {
    const coords = event.geometry[0].coordinates;
    const date = event.geometry[0].date;
    const title = event.title;
    const icon = document.createElement("div");
    icon.className = "custom-marker";
    icon.style.width = "32px";
    icon.style.height = "32px";
    icon.style.backgroundSize = "cover"; // Makes sure image fits

    if (nameOfDisaster == "Wildfires") {
      // Icon handling for each disaster
      icon.style.backgroundImage = 'url("images/1F525_color.png")';
    } else if (nameOfDisaster == "Sea and Lake Ice") {
      icon.style.backgroundImage = 'url("images/E2C0_color.png")';
    } else if (nameOfDisaster == "Volcanoes") {
      icon.style.backgroundImage = 'url("images/1F30B_color.png")';
    } else if (nameOfDisaster == "Floods") {
      icon.style.backgroundImage = 'url("images/1F30A_color.png")';
    } else if (nameOfDisaster == "Severe Storms") {
      icon.style.backgroundImage = 'url("images/2614_color.png")';
    } else if (nameOfDisaster == "Snow") {
      icon.style.backgroundImage = 'url("images/2603_color.png")';
    } else if (nameOfDisaster == "Earthquakes") {
      icon.style.backgroundImage = 'url("images/1FAA8_color.png")';
    }

    const disasterMarker = new maplibregl.Marker(icon)
      .setLngLat(coords)
      .addTo(map);
    ListOfMarkers.push(disasterMarker);

    const popup = new maplibregl.Popup({
      // Popup handling
      closeButton: false,
      closeOnClick: false,
    }).setHTML(`<strong>${title}</strong><br>Date: ${date}`);

    icon.addEventListener("mouseenter", () => {
      popup.setLngLat(coords).addTo(map);
    });

    icon.addEventListener("mouseleave", () => {
      popup.remove();
    });
  });
}
