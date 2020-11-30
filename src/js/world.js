'use strict'

const INITIAL_LATLNG = [35.681, 0];

const WORLDMAP = L.map("worldmap").setView(INITIAL_LATLNG, 2);
const MINIMAP = L.map("minimap", { zoomControl: false }).setView(INITIAL_LATLNG, 0);

const TYPE_SWITCH = document.getElementById('type_switch')

const URL_A = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const URL_B = "http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png";
//URL_Bにのみ適用可↓
const TYPE = ["toner-lite", "watercolor", "terrain", "toner"];

const typeSet = [
  [URL_A, null],
  [URL_B, TYPE[0]],
  [URL_B, TYPE[1]],
  [URL_B, TYPE[2]],
  [URL_B, TYPE[3]]
]

let i = 0
TYPE_SWITCH.addEventListener('click', () => {
  i++
  if (i === 5) i = 0;
  fetchWorld(typeSet[i]).addTo(WORLDMAP);
  fetchWorld(typeSet[i]).addTo(MINIMAP);
})

const fetchWorld = (...args) => {
  if (!args.length) {
    return L.tileLayer(URL_A, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
      variant: TYPE[0]
    })
  } else {
    console.log(args[0][0]);
    return L.tileLayer(args[0][0], {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
      variant: args[0][1],
    });
  }
}

const makeMarker = (lat_lng, name) => {
  const Markers_shape = [];
  const Markers_shape_pos = [];
  const Markers_shape_nam = [];
  Markers_shape_pos[0] = lat_lng;
  Markers_shape_nam[0] = name;
  Markers_shape[0] = L.marker([
    Markers_shape_pos[0][0],
    Markers_shape_pos[0][1],
  ]);

  Markers_shape[0]
    .bindTooltip(Markers_shape_nam[0], {
      permanent: true,
      // offset: L.point(40, 0)
    })
    .openTooltip();
  Markers_shape[0].bindPopup(Markers_shape_nam[0]).openPopup();
  return Markers_shape[0];
};

const removeMarker = (markers) => {
  markers.forEach((marker) => {
    WORLDMAP.removeLayer(marker);
  });
};

const makeCircle = (lat, lng) => {
  if (referCircle) {
    removeCircle(referCircle);
  }
  return L.circle([lat, lng], {
    radius: 2000 * 1000,
    color: "red",
    fillColor: "pink",
    fillOpacity: 0.5,
  });
};

const removeCircle = (circle) => {
  MINIMAP.removeLayer(circle);
};

const hiddenName = () => {
  if (referMarkers.length === 0) return;

  const cauntryNames = document.getElementsByClassName("leaflet-tooltip");
  if (nameHidden) {
    [...cauntryNames].forEach((name) => {
      name.style.visibility = "visible";
    });
    [...popUpDom].forEach((dom) => {
      dom.style.visibility = "hidden";
    });
    nameHidden = false;
    return;
  }

  if (!nameHidden) {
    [...cauntryNames].forEach((name) => {
      name.style.visibility = "hidden";
    });
    [...popUpDom].forEach((dom) => {
      dom.style.visibility = "visible";
    });

    nameHidden = true;
    return;
  }
};


//タイトルクリックで世界地図全体図にズームアウト
document.getElementById('title').addEventListener("click", () => {
  WORLDMAP.setView(INITIAL_LATLNG, 2)
  MINIMAP.setView(INITIAL_LATLNG, 0)
});

export { WORLDMAP, MINIMAP, fetchWorld, makeMarker, makeCircle, hiddenName, removeMarker};