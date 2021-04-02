import { WebSerial } from "./webSerial";
import { WebRawHID } from "./webRawHID";
import { WebUsbComInterface } from "./webUsbComInterface";
var Plotly = require("plotly.js-dist");

let com: WebUsbComInterface;

document.getElementById(
  "revision"
).innerText = `Revision:${process.env.REVISION}`;

const baudList = [
  "raw hid",
  1200,
  2400,
  4800,
  9600,
  14400,
  19200,
  38400,
  57600,
  115200,
  230400,
  460800,
  921600,
];

let baudSelecter: HTMLSelectElement = <HTMLSelectElement>(
  document.getElementById("baudrate")
);
baudList.forEach((val: number) => {
  let opt = document.createElement("option");
  opt.value = val.toString();
  opt.text = val.toString();
  if (opt.text === "9600") {
    opt.selected = true;
  }
  baudSelecter.appendChild(opt);
});

let buffer: number[][] = [[]];
let labels: string[] = [""];

document.getElementById("clear").onclick = () => {
  Plotly.purge("plot");
  buffer = [[]];
};

document.getElementById("save").onclick = () => {
  let download = <HTMLAnchorElement>document.getElementById("download-file");
  let data: number[][] = (document.getElementById("plot") as any).data.map(
    (d: any) => {
      return d.y;
    }
  );
  console.log(data);
  let csv = labels.join(",") + "\n";
  csv += data[0]
    .map((_, idx) => data.map((r) => r[idx]))
    .map((r) => r.join(","))
    .join("\n");

  const date = new Date(Date.now());
  let padd2 = (str: number) => ("00" + str.toString()).slice(-2);
  download.download = `${date.getFullYear()}${padd2(
    date.getMonth() + 1
  )}${padd2(date.getDate())}${padd2(date.getHours())}${padd2(
    date.getMinutes()
  )}${padd2(date.getSeconds())}.csv`;

  download.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  download.click();
};

let connectButton = document.getElementById("connect");
let updateTiemrId: NodeJS.Timeout;
connectButton.innerText = "Connect";
connectButton.onclick = async () => {
  if (com?.connected) {
    clearInterval(updateTiemrId);
    connectButton.innerText = "Connect";
    await com.close();
  } else {
    const baud = baudSelecter.selectedOptions[0].innerText;
    try {
      if (baud === "raw hid") {
        com = new WebRawHID();
        await com.open(null, {});
      } else {
        com = new WebSerial();
        await com.open(null, { baudrate: parseInt(baud) });
      }
      com.setReceiveCallback(dataReceiveHandler);

      updateTiemrId = setInterval(() => {
        if (buffer.length > 0 && buffer[0].length > 0) {
          const curves = Array.from(Array(buffer.length), (_, k) => k);
          Plotly.extendTraces("plot", { y: buffer }, curves);
          buffer = buffer.map((_) => {
            return [];
          });
        }
      }, 50);
      connectButton.innerText = "Disconnect";
    } catch (e) {
      console.error(e);
    }
  }
};

Plotly.newPlot("plot", [{ y: [], name: labels, mode: "lines" }], {
  margin: { t: 0 },
});

let recvLine: string = "";
function dataReceiveHandler(msg: Uint8Array) {
  recvLine = recvLine.concat(new TextDecoder().decode(msg));
  let lines = recvLine.split("\n");

  lines.slice(0, -1).forEach((line) => {
    let data = line.split(",");
    if (data.length > buffer.length) {
      buffer = Array(data.length)
        .fill(null)
        .map(() => {
          return [];
        });
      labels = Array(data.length)
        .fill(null)
        .map(() => {
          return "";
        });
      const trace = Array(buffer.length)
        .fill(null)
        .map((_, idx) => {
          return { y: [], yaxis: "y1", name: "y" + idx };
        });

      Plotly.purge("plot");
      Plotly.newPlot("plot", trace, {
        showlegend: true,
        legend: { x: 1, y: 0.5 },
        yaxis2: { side: "right" },
        margin: { t: 0 },
      });
    }

    data.forEach((val: string, idx) => {
      let sp = val.split(":");
      if (sp.length == 1) {
        buffer[idx].push(parseFloat(sp[0]));
      } else {
        labels[idx] = sp.slice(0, -1).join(":").trim();
        buffer[idx].push(parseFloat(sp[sp.length - 1]));
        Plotly.restyle("plot", { name: labels });
      }
    });
  });

  recvLine = lines[lines.length - 1];
}
