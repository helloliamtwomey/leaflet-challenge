const API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const TECTONIC_PLATES_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function radiusSize(magnitude) {
  return magnitude * 25000;
}

function circleColor(depth) {
  if (depth >= 90) return "#57E86B";
  if (depth >= 70) return "#78EC6C";
  if (depth >= 50) return "#A9F36A";
  if (depth >= 30) return "#DDF969";
  if (depth >= 10) return "#FEFE69";
  return "#FC6A21";
}

function createMap(data) {
  const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  const markers = data.features.map(feature => {
    return L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      fillOpacity: 5,
      fillColor: circleColor(feature.geometry.coordinates[2]),
      radius: radiusSize(feature.properties.mag),
      stroke: true,
      weight: 1
    }).bindPopup(`<h2>Location: ${feature.properties.place}</h2> <hr>
                  <h3>Depth: ${feature.geometry.coordinates[2]} km</h3>
                  <h3>Magnitude: ${feature.properties.mag}</h3>`);
  });

  const earthquakeCircle = L.layerGroup(markers);

  const tectonicPlates = new L.LayerGroup();

  d3.json(TECTONIC_PLATES_URL).then((plateData) => {
    L.geoJson(plateData, {
      color: "orange",
      weight: 2,
    }).addTo(tectonicPlates);
  });  

  const satelliteLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  const grayscaleLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  const baseMaps = {
    Street: streetLayer,
  };

  const overlayMaps = {
    Earthquakes: earthquakeCircle,
    "Tectonic Plates": tectonicPlates,
  };  

  const myMap = L.map("map", {
    center: [0.5, 30],
    zoom: 2,
    layers: [streetLayer, earthquakeCircle]
});

L.control.layers(baseMaps, overlayMaps, {
collapsed: false,
}).addTo(myMap);

const legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
const div = L.DomUtil.create("div", "legend");
div.innerHTML += "<h4>Earthquake Depth</h4>";
div.innerHTML += '<i style="background: #FC6A21"></i><span>Less than 10</span><br>';
div.innerHTML += '<i style="background: #FEFE69"></i><span>10-30</span><br>';
div.innerHTML += '<i style="background: #DDF969"></i><span>30-50</span><br>';
div.innerHTML += '<i style="background: #A9F36A"></i><span>50-70</span><br>';
div.innerHTML += '<i style="background: #78EC6C"></i><span>70-90</span><br>';
div.innerHTML += '<i style="background: #57E86B"></i><span>Above 90</span><br>';

return div;
};

legend.addTo(myMap);
}

d3.json(API_URL).then(createMap);

