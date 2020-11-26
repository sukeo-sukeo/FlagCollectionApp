const ctx = document.getElementById("myChart").getContext("2d");

const createChart = (key) => {
  const sortData = Object.keys(key).sort((a, b) => key[a].postion - key[b].postion)
  const labels = sortData.filter(d => d.length !== 0)
  const challengeCount = labels.map(label => localStorage.getItem(`${label} challengeCount`))
  const clearCount = labels.map(label => localStorage.getItem(`${label} clearCount`))
  console.log(labels, challengeCount);
  console.log(labels, clearCount);
  return new Chart(ctx, {
    // The type of chart we want to create
    type: "bar",
    // The data for our dataset
    data: {
      labels: labels,
      datasets: [
        {
          label: "テストにチャレンジした回数",
          backgroundColor: "#17a2b8",
          borderColor: "#17a2b8",
          data: challengeCount,
        },
        {
          label: "テストをクリアした回数",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: clearCount,
        },
      ],
    },

    // Configuration options go here
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 50
          }
        }]
      }
    },
  });
};

export { createChart }