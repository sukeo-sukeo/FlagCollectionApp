'use strict'

const INITIAL_LATLNG = [35.681, 0];

const WORLDMAP = L.map("worldmap").setView(INITIAL_LATLNG, 2);
const MINIMAP = L.map("minimap", { zoomControl: false }).setView(INITIAL_LATLNG, 0);
// const MARKER = document.querySelector('.leaflet-marker-pane')

const URL = "http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png";

const fetchWorld = () => {
  return L.tileLayer(URL, {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    variant: "toner-lite"
  })
}

//タイトルクリックで世界地図全体図にズームアウト
document.getElementById('title').addEventListener("click", () => {
  WORLDMAP.setView(INITIAL_LATLNG, 2)
  MINIMAP.setView(INITIAL_LATLNG, 0)
});

export { WORLDMAP, MINIMAP, fetchWorld};