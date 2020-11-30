'use strict'
import {createTag} from '../index.js'

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


export {
  createCollectionView
}