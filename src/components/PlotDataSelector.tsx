import * as React from "react";
import { PlotDataSelectorLines } from "./PlotDataSelectorLines";
import { PlotDataSelectorScatters } from "./PlotDataSelectorScatters";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";

interface PlotData {
  dict: { [label: string]: number[] };
}

interface TraceData {
  data: any;
  layout: any;
}

const PlotDataSelector = (props: {
  data: PlotData;
  labels: string[];
  onUpdate: (arg0: TraceData) => void;
  plots: any;
}) => {
  const [labels, setLabels] = React.useState([]);
  const [plotType, setPlotType] = React.useState(
    new Array(props.plots.length)
      .fill(0)
      .map((_, idx) => idx)
      .reduce((prev, curr) => {
        prev[curr] = props.plots[curr]?.mode;
        return prev;
      }, {})
  );
  const [plots, setPlots] = React.useState(props.plots);
  const [plotKeys, setPlotKeys] = React.useState(
    props.plots.length > 0
      ? new Array(props.plots.length).fill(0).map((_, idx) => idx)
      : [0]
  );

  React.useEffect(() => {
    setLabels(props.labels);
  }, [props.labels]);

  const handleChange = (key: number) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPlotType = Object.assign({}, plotType);
      newPlotType[key] = e.target.value;
      setPlotType(newPlotType);
      console.log(plotType);
    };
  };

  const changePlots = (key, data) => {
    plots[key] = data;
    setPlots(plots);
    props.onUpdate({
      data: Object.values(plots),
      layout: { margin: { l: 30, b: 30, t: 30 } },
    });
  };

  const selector = (key: number) => {
    if (plotType[key] === "scatters") {
      return (
        <PlotDataSelectorScatters
          data={props.data}
          labels={labels}
          value={plots[key] ?? {}}
          onUpdate={(data) => {
            changePlots(key, data);
          }}
        />
      );
    } else {
      return (
        <PlotDataSelectorLines
          data={props.data}
          labels={labels}
          value={plots[key] ?? {}}
          onUpdate={(data) => {
            changePlots(key, data);
          }}
        />
      );
    }
  };

  const plotSelector = (key: number) => {
    return (
      <Grid key={key} container spacing={3}>
        <Grid item xs={4}>
          <FormControl>
            <InputLabel id="plotType">Plot Type</InputLabel>
            <Select
              labelId="plotType"
              value={plotType[key] ?? "lines"}
              onChange={handleChange(key)}
            >
              <MenuItem value="lines">Lines</MenuItem>
              <MenuItem value="scatters">Scatters</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={7}>
          {selector(key)}
        </Grid>
        <Grid item xs={1}>
          <IconButton
            color="secondary"
            onClick={() => {
              const newKeys = plotKeys.filter((x) => x != key);
              setPlotKeys(newKeys);
              const newPlots = newKeys.reduce((prev, curr) => {
                prev[curr] = plots[curr];
                return prev;
              }, {});
              setPlots(newPlots);

              props.onUpdate({
                data: Object.values(newPlots),
                layout: {},
              });
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  return (
    <div style={{ width: "700px", margin: "10px" }}>
      {plotKeys.map((k) => {
        return plotSelector(k);
      })}
      <Button
        variant="outlined"
        onClick={() => {
          setPlotKeys(plotKeys.concat(plotKeys[plotKeys.length - 1] + 1));
          console.log("onClick");
        }}
      >
        <AddIcon />
        TRACE
      </Button>
    </div>
  );
};
export { PlotDataSelector, PlotData, TraceData };
