import * as React from "react";
import ReactDOM from "react-dom";
import { Control } from "./components/Control";
import { PlotCollection, PlotData } from "./components/PlotCollection";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

if (!navigator.serial) {
  alert("Please use chrome or edge");
}

interface AppState {
  plotData: PlotData;
  labels: string[];
}

class App extends React.Component<any, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { plotData: { dict: {} }, labels: [] };
  }

  theme = createMuiTheme({
    overrides: {
      MuiButton: {
        root: {
          minWidth: 130,
        },
      },
      MuiFormControl: {
        root: {
          minWidth: 120,
          margin: 4,
        },
      },
      MuiGrid: {
        root: {
          alignItems: "center",
        },
      },
      MuiPopover: {
        root: {
          minHeight: "100px",
        },
      },
    },
  });

  render() {
    return (
      <ThemeProvider theme={this.theme}>
        <header>
          <h2>Web Serial Plotter</h2>
        </header>
        <Control
          data={this.state.plotData.dict}
          onNewLabel={(newLabels) => {
            this.setState({ labels: newLabels.slice() });
          }}
          onUpdate={(newData) => {
            this.setState({ plotData: { dict: newData } });
          }}
        />
        <PlotCollection dct={this.state.plotData} labels={this.state.labels} />

        <footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "#ddd",
          }}
        >
          <Grid container spacing={0}>
            <Grid item xs={4}>
              <a href="https://github.com/sekigon-gonnoc/web-serial-plotter">
                View on Github
              </a>
            </Grid>
            <Grid item xs={4}>
              <div style={{ textAlign: "center" }}>
                Copyright (c) 2021{" "}
                <a href="https://nogikes.booth.pm/">のぎけす屋</a>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div style={{ textAlign: "right" }}>
                {`revision:${process.env.REVISION}`}
              </div>
            </Grid>
          </Grid>
        </footer>
      </ThemeProvider>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
