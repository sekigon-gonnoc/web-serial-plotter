import { WebSerial } from "./../webSerial";
import { WebRawHID } from "./../webRawHID";
import { WebUsbComInterface } from "./../webUsbComInterface";
import { BaudrateSelector } from "./BaudrateSelector";
import * as React from "react";
import { Button, IconButton, Tooltip, Grid } from "@material-ui/core";
import UsbIcon from "@material-ui/icons/Usb";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import HelpIcon from "@material-ui/icons/Help";
import { withStyles } from "@material-ui/styles";

interface ControlState {
  com: WebUsbComInterface | null;
  baudrate: string;
  recvLine: string;
  data: { [label: string]: number[] };
  connected: boolean;
}

interface ControlProps {
  data: { [label: string]: number[] };
  onNewLabel: (labels: string[]) => void;
  onUpdate: (newData: { [label: string]: number[] }) => void;
}

class Control extends React.Component<ControlProps, ControlState> {
  constructor(props: ControlProps) {
    super(props);
    this.state = {
      com: null,
      baudrate: "9600",
      recvLine: "",
      data: props.data,
      connected: false,
    };
  }

  getConnectBtnName() {
    if (!this.state.connected) {
      return "Open";
    } else {
      return "Close";
    }
  }

  async onConnectClick() {
    if (this.state.com?.connected) {
      await this.state.com.close();
      this.setState({ com: this.state.com });
    } else {
      const com =
        this.state.baudrate === "raw_hid" ? new WebRawHID() : new WebSerial();

      this.setState({ com: com, recvLine: "" });
      com.setCloseCallback(() => {
        this.setState({ connected: false });
      });
      await com.open(
        () => {
          this.setState({ connected: true });
        },
        { baudrate: this.state.baudrate }
      );

      // receiveCallback can be added after open
      com.setReceiveCallback((msg: Uint8Array) => {
        this.dataReceiveHandler(msg);
      });
    }
  }

  onClearClick() {
    for (let d of Object.values(this.state.data)) {
      d.splice(0);
    }
    this.setState({ data: this.state.data, recvLine: "" });
  }

  onSaveClick() {
    let csv = Object.keys(this.state.data).join(",") + "\n";
    let maxLen = Math.max(
      ...Object.values(this.state.data).map((x: number[]) => {
        return x.length;
      })
    );

    const arr = Object.values(this.state.data).map((data) => {
      if (data.length < maxLen) {
        return data.concat(Array(maxLen - data.length).fill(""));
      } else {
        return data;
      }
    });

    for (let idx = 0; idx < maxLen; idx++) {
      const line = arr
        .map((data) => {
          return data[idx];
        })
        .join(",");
      csv += line + "\n";
    }

    const date = new Date(Date.now());
    let padd2 = (str: number) => ("00" + str.toString()).slice(-2);
    const fileName = `${date.getFullYear()}${padd2(date.getMonth() + 1)}${padd2(
      date.getDate()
    )}${padd2(date.getHours())}${padd2(date.getMinutes())}${padd2(
      date.getSeconds()
    )}.csv`;

    const fileLink = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    let a = document.createElement("a");
    a.href = fileLink;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onDownloadChange(e: React.ChangeEvent<HTMLAnchorElement>) {
    console.log(e);
    e.target.click();
  }

  dataReceiveHandler(msg: Uint8Array) {
    let recvLine = this.state.recvLine.concat(new TextDecoder().decode(msg));
    let lines = recvLine.split("\n");
    let addLabel = false;

    if (lines.length > 1) {
      lines = lines.slice(1);
    }

    lines.slice(0, -1).forEach((line) => {
      // ignore blank line
      if (line.length == 0) {
        return;
      }

      let data = line.split(",");

      data.forEach((val: string, idx) => {
        let sp = val.split(":");
        let label = "";
        let ydata: string;
        if (sp.length == 1) {
          label = "unnamed" + idx;
          ydata = sp[0];
        } else {
          label = sp.slice(0, -1).join(":").trim();
          ydata = sp[sp.length - 1];
        }
        if (!this.state.data[label]) {
          this.state.data[label] = [];
          addLabel = true;
        }
        this.state.data[label].push(parseFloat(ydata));
      });
    });

    if (addLabel) {
      const newLabels = Object.keys(this.state.data).slice();
      this.props.onNewLabel(newLabels);
    }

    recvLine = "\n" + lines[lines.length - 1];
    this.setState({ recvLine: recvLine, data: this.state.data });
    /* this.props.onUpdate(this.state.data); */
  }

  ControlInputs = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <BaudrateSelector
            onChange={(val: string) => {
              this.setState({ baudrate: val });
            }}
            defaultBaud={this.state.baudrate}
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.onConnectClick();
            }}
          >
            <UsbIcon /> {this.getConnectBtnName()}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.onSaveClick();
            }}
          >
            <SaveIcon />
            SAVE
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              this.onClearClick();
            }}
          >
            <DeleteIcon />
            CLEAR
          </Button>
        </Grid>
      </Grid>
    );
  };

  HelpTooltip = withStyles((_theme) => ({
    tooltip: { fontSize: "15px", whiteSpace: "pre-line", maxWidth: "500px" },
  }))(Tooltip);

  render() {
    return (
      <Grid style={{ width: "650px" }} container spacing={1}>
        <Grid item xs={10}>
          {this.ControlInputs()}
        </Grid>
        <Grid item xs={1}>
          <this.HelpTooltip
            title={
              "This app plot data received through a serial port.\nAll plot panels are interactive, resizable, and movable.\n\nData format:\n<label1>:<data1>, <label2>:<data2>, ...\n<data1>,<data2>, ..."
            }
          >
            <IconButton>
              <HelpIcon />
            </IconButton>
          </this.HelpTooltip>
        </Grid>
      </Grid>
    );
  }
}

export { Control };
