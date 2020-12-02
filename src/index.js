"use strict";

import "./style.scss";
import { WORLDMAP, MINIMAP, fetchWorld } from "./js/world.js";
import { createChart } from "./js/chart.js";
import { dataManage, MARKER_URL, baseUrl, aboutMe, deleteStore } from "./js/data.js";
import { createTag } from './js/function.js'
import { BATU, MARU } from "./js/marubatu";

const SELECT_BOX = document.getElementById("sub_region");
const START_BTN = document.getElementById("start_btn");
const SWITCH_BTN = document.getElementById("name_switch");
const FLAG_WRAPPER = document.getElementById("cauntry_flag_wrapper");
const RESULT_CLOSE_BTN = document.getElementById("result_close");

const deleteBtn = document.getElementById("deletdata_btn");
const collectionBtn = document.getElementById('collection_btn')
const menuBtn = document.getElementById('menue_btn')
const aboumeBtn = document.getElementById('aboutme_btn')
const popUpDom = document.getElementsByClassName("leaflet-popup-pane");

const Q_LEVEL = {
  easy: 5,
  normal: 10,
  hard: 15,
};

let level = Q_LEVEL.normal;

let correctCount = null;
let mistakeCount = null;

let referMarkers = [];
let referCircle;
let subregionName;

let isPlaying = false;
let nameHidden = false;

const fetchData = (str) => fetch(baseUrl + str).then((res) => res.json());

const firstReading = () => {
  fetchWorld().addTo(WORLDMAP);
  fetchWorld().addTo(MINIMAP);
  fetchData("all").then((data) => {
    
    const headerDict = makeDict(data);
    const headerDOMs = createSubregionTags(headerDict);
    headerDOMs.forEach((dom) => {
      SELECT_BOX.appendChild(dom);
    });
    [...popUpDom].forEach((dom) => {
      dom.style.visibility = "hidden";
    });
  }).then(() => {
    if (!localStorage.getItem('isStarted')) setTimeout(() => aboutMe(), 1500)
    setTimeout(() => localStorage.setItem("isStarted", "true"), 2000);
  })
};

deleteBtn.addEventListener('click', () => {
  deleteStore()
  createChart(dataManage)
})

aboumeBtn.addEventListener('click', () => aboutMe())

collectionBtn.addEventListener('click', () => fetchData("all").then((data) => createCollectionView(data)))

menuBtn.addEventListener('click', () => createChart(dataManage))


RESULT_CLOSE_BTN.addEventListener("click", () => {
  const result = document.getElementById("result");
  initElements(result);
  createChart(dataManage);
});

SWITCH_BTN.addEventListener("click", () => hiddenName());

START_BTN.addEventListener("click", () => {
  if (isPlaying) {
    if (confirm("テストをあきらめて地域選択にもどりますか？")) {
      changeBtn("テストにチャレンジ");
      document.getElementById("subregion_name").textContent = "";
      createChart(dataManage)
      clearView();
      return;
    } else {
      return;
    }
  }

  if (referMarkers.length === 0) {
    alert("地域を選択してください");
    return;
  }

  if (!localStorage[`${subregionName} challengeCount`]) {
    localStorage.setItem(`${subregionName} challengeCount`, 1);
  } else {
    const val =
      parseInt(localStorage.getItem(`${subregionName} challengeCount`)) + 1;
    localStorage.setItem(`${subregionName} challengeCount`, val);
  }

  setFlagDOM(referMarkers);
  const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
  const FLAGS_DOM = document.querySelectorAll(".flag_pic");
  MARKERS_DOM.forEach((d) => {
    d.setAttribute("src", MARKER_URL);
    d.style.width = "30px";
    d.style.height = "30px";
  });

  menuBtn.style.visibility = 'hidden'
  changeBtn("あきらめる");

  const TARGET_DOMS = [...MARKERS_DOM, ...FLAGS_DOM];
  playGame(TARGET_DOMS);
});

//エリア選択で
SELECT_BOX.addEventListener("click", (event) => {
  if (event.target.className.split(" ")[0] !== "subregion") {
    return;
  }
  if (isPlaying) {
    return;
  }

  referMarkers.forEach((d) => {
    d.closePopup();
  });

  initElements(FLAG_WRAPPER);

  subregionName = event.target.textContent;
  document.getElementById('subregion_name').textContent = subregionName
  const target = event.target.id.replace(/_/g, " ");
  fetch(baseUrl + "subregion/" + target)
    .then((res) => res.json())
    .then((data) => {
      //dataを整形
      return shuffle(formatData(data));
    })
    .then((data) => {
      //マーカーを設置
      const markers = data.map(d => {
        return makeMarker(
          [d.latlng[0], d.latlng[1]],
          d.translations.ja
        );
      });

      //マーカーデータの参照を作成
      referMarkers = markers;

      //ズームインの為の座標値を算出
      let sumLat = null;
      let sumLng = null;

      markers.forEach((marker) => {
        sumLat += marker._latlng.lat;
        sumLng += marker._latlng.lng;
        marker.addTo(WORLDMAP);
      });

      //ズームしてポインタを表示
      WORLDMAP.setView([sumLat / markers.length, sumLng / markers.length], 4);
      const circle = makeCircle(
        sumLat / markers.length,
        sumLng / markers.length
      );
      referCircle = circle;
      circle.addTo(MINIMAP);
      return data;
    })
    .then((data) => {
      const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
      MARKERS_DOM.forEach((DOM, i) => {
        //classの座標値でjudgeする方向性
        DOM.classList.add(data[i].latlng.join("_"));
        //マーカーのimgを国旗に変更
        DOM.setAttribute("src", data[i].flag);
        DOM.style.width = "60px";
        DOM.style.height = "40px";
      });
    });
});

const playGame = (TERGET_DOMS) => {
  isPlaying = true;
  if (correctCount === TERGET_DOMS.length / 2 || correctCount === level) {
    gameClear(TERGET_DOMS);
    return;
  }
  let answers = [];
  TERGET_DOMS.forEach((target_dom) => {
    target_dom.onclick = (e) => {
      const ansContainer = e.target.className.split(" ")[0];
      const ansLatLng = e.target.className.split(" ")[3];
      console.log('205', ansContainer, ansLatLng);
      if (
        // １枚めと同じcontainerは選択できない
        (answers.length === 1 && answers[0][0] === ansContainer) ||
        // 正解したマーカーは選択できない
        e.target.getAttribute("name") === "corrected"
      ) {
        return;
      } else {
        e.target.classList.add("clicked");
        answers.push([ansContainer, ansLatLng, e.target]);
      }
      if (answers.length === 2) {
        judge(answers, TERGET_DOMS);
      }
    };
  });
};

const judge = (answers, TERGET_DOMS) => {
  console.log('225', answers[0]);
  console.log('226', answers[1]);
  console.log('227', answers[0][1], answers[1][1]);
  if (answers[0][1] === answers[1][1]) {
    const markerDom = getImgSrc(answers).markerDom;
    const flagSrc = getImgSrc(answers).flagSrc;
    const flagDom = getImgSrc(answers).flagDom;
    MARU(true);
    setTimeout(() => {
      changeClass(/*del =*/ "clicked", /*add =*/ false);
      flagDom.classList.add("corrected");
      markerDom.setAttribute("name", "corrected");
      markerDom.setAttribute("src", flagSrc);
      markerDom.style.width = "40px";
      markerDom.style.height = "30px";
      MARU(false)
    }, 1000);
    correctCount++;
    console.log('correct!', correctCount);
  } else {
    BATU(true);
    setTimeout(() => {
      changeClass(/*del =*/ "clicked", /*add =*/ false)
      BATU(false);
    }, 1000);
    mistakeCount++;
    console.log('miss!', mistakeCount);
  }
  answers.length = 0;
  playGame(TERGET_DOMS);
};

const gameClear = (data) => {
  isPlaying = false;
  document.getElementById("subregion_name").textContent = ""
  changeBtn("テストにチャレンジ");
  if (!localStorage[`${subregionName} clearCount`]) {
    localStorage.setItem(`${subregionName} clearCount`, 1);
  } else {
    const val =
      parseInt(localStorage.getItem(`${subregionName} clearCount`)) + 1;
    localStorage.setItem(`${subregionName} clearCount`, val);
  }

  const getFlagImgs = data.filter(
    (d) => d.className.split(" ")[0] === "flag_pic"
  );
  const src = getFlagImgs.map((img) => img.getAttribute("src"));
  const name = getFlagImgs.map((img) => img.getAttribute("name"));

  const msg = document.getElementById("clearMsg");
  $("#result_modal").modal();
  if (!mistakeCount) {
    result_getFlag(src, name, src.length);
    msg.textContent = "Get all flags!　すべての国旗をゲット！";
    clearView();
    return;
  }
  if (mistakeCount <= 5) {
    result_getFlag(src, name, 5);
    msg.textContent = "Get two flags! ２枚の国旗をゲット！";
    clearView();
    return;
  }
  if (mistakeCount <= 3) {
    result_getFlag(src, name, 3);
    msg.textContent = "Get three flags! ３枚の国旗をゲット！";
    clearView();
    return;
  }
  result_getFlag(src, name, 1);
  msg.textContent = "Get one flags! １枚の国旗をゲット！";
  clearView();
};

const result_getFlag = (src, name, leng) => {
  const result = document.getElementById("result");
  for (let i = 0; i < leng; i++) {
    createTag(
      "img",
      [
        ["src", src[i]],
        ["alt", name[i]],
        ["class", "result_flag"],
      ],
      false,
      result
    );
    localStorage.setItem(`${name[i]} src`, src[i]);
  }
};

const clearView = () => {
  isPlaying = false;
  correctCount = 0;
  mistakeCount = 0;
  menuBtn.style.visibility = "visible";
  initElements(FLAG_WRAPPER);
  referMarkers.length = 0;
};

const makeDict = (data) => {
  const dict = new Map();
  data.forEach((e) => {
    if (dict.has(e.subregion)) {
      const x = dict.get(e.subregion);
      dict.set(e.subregion, parseInt(x + 1));
    } else {
      dict.set(e.subregion, 1);
    }
  });
  return dict;
};

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

const createCollectionView = (data) => {
  const COLLECTION_WRAPPER = document.getElementById("collection");
  (async () => {
    const get = await COLLECTION_WRAPPER.getElementsByTagName("img");
    const total = await COLLECTION_WRAPPER.children;
    document.getElementById(
      "getcount"
    ).textContent = `${get.length}/${total.length}`;
  })();
  initElements(COLLECTION_WRAPPER);
  for (let i = 0; i < data.length; i++) {
    if (!data[i].translations.ja) continue;
    const tag = createTag(
      "span",
      [
        ["class", "result_flag mx-2"],
        ["name", data[i].flag],
      ],
      data[i].translations.ja,
      false
    );

    const src = localStorage.getItem(`${data[i].translations.ja} src`);
    if (tag.getAttribute("name") === src) {
      const parent = createImgTags(src, data, i);
      COLLECTION_WRAPPER.appendChild(parent);
    } else {
      tag.style.backgroundColor = "gainsboro";
      COLLECTION_WRAPPER.appendChild(tag);
    }
  }

  const collectionRate = document.getElementById("collection_rate");
  const flagImg = COLLECTION_WRAPPER.getElementsByClassName("pic");
  const flagImgCount = flagImg.length;
  const rate = ((flagImgCount / (data.length - 3)) * 100).toFixed(1);
  collectionRate.textContent = rate + "%";
};

const createImgTags = (src, data, i) => {
  const parentTag = createTag(
    "div",
    [
      ["class", "dropdown"],
      ["style", "display: inline-block; left: 1%;"],
    ],
    false,
    false
  );
  createTag(
    "img",
    [
      ["src", src],
      ["class", "result_flag pic dropdown-toggle"],
      ["name", data[i].name],
      ["id", "collection_flag_toggle"],
      ["data-toggle", "dropdown"],
      ["aria-haspopup", "true"],
      ["aria-expanded", "false"],
    ],
    false,
    parentTag
  );

  const childTag = createTag(
    "ul",
    [
      ["class", "dropdown-menu bg-transparent"],
      ["style", "width: 250px; border: none;"],
      ["aria-labelledby", "collection_flag_toggle"],
    ],
    false,
    parentTag
  );

  const dataObj = createComparisonData(data, i);

  createTag(
    "li",
    ["class", "list-group-item p-2 bg-dark text-white"],
    "国名: " + dataObj.name,
    childTag
  );
  createTag(
    "li",
    ["class", "list-group-item p-2 bg-dark text-white"],
    "首都: " + dataObj.capital,
    childTag
  );
  createTag(
    "li",
    ["class", "list-group-item p-2 bg-dark text-white"],
    "人口: " + dataObj.papulation + "人",
    childTag
  );
  createTag(
    "li",
    ["class", "list-group-item p-2 bg-dark text-white"],
    "広さ: " + dataObj.area + "㎢",
    childTag
  );
  createTag(
    "li",
    ["class", "list-group-item p-2 bg-dark text-white"],
    "地域: " + dataObj.subregion,
    childTag
  );
  createTag(
    "li",
    [
      ["class", "list-group-item p-1 bg-light border-bottom-0"],
      ["style", "font-size: 12px;"],
    ],
    `日本の${dataObj.popldiff}倍の人口`,
    childTag
  );
  createTag(
    "li",
    [
      ["class", "list-group-item p-1 bg-light border-bottom-0 border-top-0"],
      ["style", "font-size: 12px;"],
    ],
    `日本の${dataObj.areadiff}倍の広さ`,
    childTag
  );
  createTag(
    "li",
    [
      ["class", "list-group-item p-1 bg-light  border-bottom-0 border-top-0"],
      ["style", "font-size: 12px;"],
      ["name", dataObj.code],
    ],
    `日本と約${dataObj.jisa}時間違います`,
    childTag
  );
  createTag(
    "li",
    [
      ["class", "list-group-item p-1 bg-light border-bottom-0 border-top-0"],
      ["style", "font-size: 12px;"],
    ],
    `この国は今${dataObj.time.M}月${dataObj.time.D}日(${dataObj.time.W})${dataObj.time.H}時${dataObj.time.Mi}分です`,
    childTag
  );
  createTag(
    "li",
    [
      [
        "class",
        "bigflag_btn list-group-item p-2 bg-info text-white  border-top-0",
      ],
      ["style", "font-size: 12px;"],
      ["name", data[i].name],
    ],
    "国旗を見る",
    childTag
  );

  const bigflags = document.getElementsByClassName("bigflag_btn");
  const bigflag = document.getElementById("bigflagimg");
  const flagname = document.getElementById("flagname");
  [...bigflags].forEach((flag) => {
    flag.onclick = (e) => {
      const cauntryName = e.target.getAttribute("name");
      fetchData("name/" + cauntryName).then((data) => {
        flagname.textContent = data[0].translations.ja;
        bigflag.setAttribute("src", data[0].flag);
        $("#bigflag_modal").modal();
      });
    };
  });
  return parentTag;
};

const createComparisonData = (data, i) => {
  const jaArea = 377930;
  const jaPopl = 126960000;
  const today = new Date();
  const japanTime = today.getTime() - 9 * (60 * 60 * 1000);
  const jisa = parseInt(data[i].timezones[0].split(":")[0].slice(4, 6));
  const code = data[i].timezones[0].split(":")[0][3];
  const worldTime = new Date(
    Number(japanTime) + Number(code + jisa * 60 * 60 * 1000)
  );
  const weekStr = ["日", "月", "火", "水", "木", "金", "土"];
  return {
    name: data[i].translations.ja,
    capital: data[i].capital,
    papulation: Number(data[i].population).toLocaleString(),
    area: Number(data[i].area).toLocaleString(),
    subregion: data[i].subregion,
    areadiff: (data[i].area / jaArea).toFixed(2),
    popldiff: (data[i].population / jaPopl).toFixed(2),
    time: {
      M: worldTime.getMonth() + 1,
      D: worldTime.getDate(),
      W: weekStr[worldTime.getDay()],
      H: worldTime.getHours(),
      Mi: worldTime.getMinutes(),
    },
    jisa: 9 - Number(code + jisa),
    code: code,
  };
};


const createSubregionTags = (dict) => {
  let i = 0;
  let renameKey = [];
  let japaneseKey = Object.keys(dataManage);
  let beforeSortData = [];
  dict.forEach((val, key) => {
    renameKey.push(key.replace(key, japaneseKey[i]));
    if (key) {
      const outlineTag = createTag(
        "div",
        ["class", "select_btn my-1 mr-3 " + dataManage[japaneseKey[i]].postion],
        false,
        false
      );
      createTag(
        /*tag*/ "button",
        [
          [/*attr1*/ "id", `${key.replace(/\s+/g, "_")}`],
          [/*attr2*/ "class", `subregion btn btn-outline-dark py-1 px-3`],
        ],
        /*value*/ renameKey[i],
        /*append*/ outlineTag
      );
      
      const innerTag = createTag(
        "div",
        ["class", "content_wrap m-0 p-0"],
        false,
        outlineTag
      );
      createTag(
        "p",
        ["class", "cauntry_count subregion_content m-0 p-0"],
        `${val}カ国`,
        innerTag
      );
      createTag(
        "p",
        ["class", "level subregion_content m-0 p-0"],
        "",
        innerTag
      );
      const getval1 = () => {
        const val = localStorage.getItem(`${renameKey[i]} challengeCount`);
        if (val) {
          return val;
        } else {
          return 0;
        }
      };

      const getval2 = () => {
        const val = localStorage.getItem(`${renameKey[i]} clearCount`);
        if (val) {
          return val;
        } else {
          return 0;
        }
      };
      createTag(
        "p",
        [
          ["class", "info subregion_content m-0 p-0"],
          ["href", "#"],
        ],
        `チャレンジ: ${getval1()}  クリア: ${getval2()}`,
        outlineTag
      );
      beforeSortData.push(outlineTag);
    }
    i++;
  });
  return beforeSortData.sort(
    (a, b) => a.className.split(" ")[3] - b.className.split(" ")[3]
  );
};

const formatData = (data) => {
  let flagData = [];
  data.forEach((d) => {
    if (d.latlng[0] !== undefined || d.latlng[1] !== undefined) {
      flagData.push({
        name: d.name,
        flag: d.flag,
        latlng: [d.latlng[0], d.latlng[1]],
        translations: d.translations,
      });
    }
  });
  return flagData;
};

const setFlagDOM = (flagData) => {
  for (let i = 0; i < level; i++) {
    if (i >= flagData.length) return;
    createTag(
      "img",
      [
        ["src", flagData[i]._icon.currentSrc],
        [
          "class",
          `flag_pic _ __ ${flagData[i]._latlng.lat}_${flagData[i]._latlng.lng}`,
        ],
        ["name", flagData[i]._tooltip._content],
      ],
      false,
      FLAG_WRAPPER
    );
  }
};

const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    //これ↓がないとpromise errorとなる
    console.log(i);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

const initElements = (...args) => {
  if (referMarkers) {
    removeMarker(referMarkers);
  }
  if (referCircle) {
    removeCircle(referCircle);
  }
  args.forEach((arg) => {
    while (arg.firstChild) {
      arg.removeChild(arg.firstChild);
    }
  });
};

const changeClass = (delClassName, addClassName) => {
  const elements = document.querySelectorAll(`.${delClassName}`);
  console.log(elements);
  elements.forEach((element) => element.classList.remove(delClassName));
  if (addClassName) {
    elements.forEach((element) => element.classList.add(addClassName));
  }
};

const getImgSrc = (answers) => {
  if (answers[0][0] !== "flag_pic") {
    return {
      markerDom: answers[0][2],
      markerSrc: answers[0][2].getAttribute("src"),
      flagDom: answers[1][2],
      flagSrc: answers[1][2].getAttribute("src"),
    };
  } else {
    return {
      markerDom: answers[1][2],
      markerSrc: answers[1][2].getAttribute("src"),
      flagDom: answers[0][2],
      flagSrc: answers[0][2].getAttribute("src"),
    };
  }
};

const changeBtn = (text) => {
  if (text === "あきらめる") {
    START_BTN.textContent = text;
    START_BTN.classList.remove("btn-info");
    START_BTN.classList.add("btn-danger");
  } else if (text === "テストにチャレンジ") {
    START_BTN.textContent = text;
    START_BTN.classList.remove("btn-danger");
    START_BTN.classList.add("btn-info");
  }
};

window.onload = firstReading();

export {createTag}