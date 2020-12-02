'use strict'

const { createTag } = require("./function")

const MARU = (bool) => {
  if (bool) {
    createTag(
      "canvas",
      [
        ["id", "maru"],
        [
          "style",
          "position: absolute; z-index: 5000; width: 95vw; height: 500px; top: 5%;",
        ],
      ],
      false,
      document.getElementById("game_wrapper")
    );

    const context = document.getElementById("maru").getContext("2d");
    // パスをリセット
    context.beginPath();

    // 円の中心座標: (100,100)
    // 半径: 50
    // 開始角度: 0度 (0 * Math.PI / 180)
    // 終了角度: 360度 (360 * Math.PI / 180)
    // 方向: true=反時計回りの円、false=時計回りの円
    context.arc(160, 75, 50, (0 * Math.PI) / 180, (360 * Math.PI) / 180, false);

    // 塗りつぶしの色
    context.fillStyle = "transparent";
    // 塗りつぶしを実行
    context.fill();

    // 線の色
    context.strokeStyle = "red";

    // 線の太さ
    context.lineWidth = 8;

    // 線を描画を実行
    context.stroke();
  } else {
    document.getElementById('maru').remove()
  }  
}

const BATU = (bool) => {
  if (bool) {
    createTag(
      "canvas",
      [
        ["id", "batu"],
        [
          "style",
          "position: absolute; z-index: 5000; width: 95vw; height: 500px; left: 20%; top: -5%;",
        ],
      ],
      false,
      document.getElementById("game_wrapper")
    );

    const context = document.getElementById("batu").getContext("2d");

    context.font = "96px serif";
    context.fillStyle = "red";
    context.fillText("✗", 70, 120);


  } else {
    document.getElementById('batu').remove()
  }
  
}

export {MARU, BATU}

