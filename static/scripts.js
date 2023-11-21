const canvas = document.getElementById('chart')
const ctx = canvas.getContext('2d')

function drawLine (start, end, style) {
  ctx.beginPath()
  ctx.strokeStyle = style || 'black'
  ctx.moveTo(...start)
  ctx.lineTo(...end)
  ctx.stroke()
}

function drawTriangle (apex1, apex2, apex3) {
  ctx.beginPath()
  ctx.moveTo(...apex1)
  ctx.lineTo(...apex2)
  ctx.lineTo(...apex3)
  ctx.fill()
}

const spinner = document.querySelector('.rotate');

async function fetchStocks() {
  const stockList = await (await fetch("/stocks")).json();

  let stockNames = [];
  let stockReqs = [];
  stockList["stockSymbols"].forEach(async (stock) => {
    try {
      stockNames.push(stock);
      stockReqs.push(fetch("/stocks/"+stock));
    } catch(err) {
      console.log("fetch failed");
    }
  })

  let stockResponses = await Promise.all(stockReqs);
  for (let i=0; i<stockResponses.length; i++) {
    let retries = 0;
    while (stockResponses[i].status != 200 && retries < 3) {
      retries++;

      console.log(`failed: retying ${retries} times...`);
      stockResponses[i] = await fetch("stocks/"+stockNames[i]);
    }
    
    if (stockResponses[i].status != 200) {
      console.log("timeout: skipping this stock...");
      continue;
    }
  }

  spinner.classList.remove("rotate");

  for (let i=0; i<stockResponses.length; i++) {
    console.log(`${stockNames[i]}: `);

    const res = stockResponses[i];
    try {
      let stock = await res.json();
      drawStock(stock);
      stock.forEach((point) => {
        console.log(`value: ${point["value"]}, time: ${point["timestamp"]}`);
      });
    } catch(err) {
      console.log("failed to fetch");
    }
  }
}

function drawStock(points) {
  if (points.length <= 0) {
    return;
  }

  const minX = 50;
  const maxX = 950;
  const rangeX = maxX - minX;
  const maxY = 550;
  const scaleY = 4;
  startTime = points[0]["timestamp"];
  timeRange = points[points.length-1]["timestamp"] - startTime;
  for (let i=0; i<points.length-1; i++){
    const p1 = points[i];
    const p2 = points[i+1];
    t1 = (p1["timestamp"] - startTime) / timeRange * rangeX + minX;
    t2 = (p2["timestamp"] - startTime) / timeRange * rangeX + minX;
    
    drawLine([t1, maxY - p1["value"] * scaleY] , [t2, maxY - p2["value"] * scaleY]);
  }
}

async function main() {
  fetchStocks();
}

main();

drawLine([50, 50], [50, 550])
drawTriangle([35, 50], [65, 50], [50, 35])

drawLine([50, 550], [950, 550])
drawTriangle([950, 535], [950, 565], [965, 550])
