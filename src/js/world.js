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
  if (window.navigator.userAgent.includes("Chrome")) {
    alert(`
    Chromeブラウザでは地図切り替え機能はご利用頂けません。
    Safari・Firefox・Microsoft Edgeなどでご利用頂けます。
    `)
    return
  }
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
    return L.tileLayer(args[0][0], {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
      variant: args[0][1],
    });
  }
}

//タイトルクリックで世界地図全体図にズームアウト
document.getElementById('title').addEventListener("click", () => {
  WORLDMAP.setView(INITIAL_LATLNG, 2)
  MINIMAP.setView(INITIAL_LATLNG, 0)
});

export { WORLDMAP, MINIMAP, fetchWorld};