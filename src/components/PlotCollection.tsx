import * as React from "react";
import Plot from "react-plotly.js";
import { Button, Grid } from "@material-ui/core";
import { Add, Close } from "@material-ui/icons";
/* import { PlotDataSelector, PlotData } from "./PlotDataSelector"; */
import { PlotArea, PlotData } from "./PlotArea";

const PlotCollection = (props: { dct: PlotData; labels: string[] }) => {
  const [plotIdx, setPlotIdx] = React.useState([0]);
  const [labels, setLabels] = React.useState([]);
  const [buttomPos, setButtomPos] = React.useState({ 0: 0 } as {
    [label: string]: number;
  });
  /* const [plot, setPlot] = React.useState([<Plot data={[{}]} layout={{}} />]); */

  React.useEffect(() => {
    setLabels(props.labels);
  }, [props.labels]);

  const handleClick = () => {
    /* setPlot(plot.concat(<Plot data={[{}]} layout={{}} />)); */
    if (plotIdx.length > 0) {
      setPlotIdx(plotIdx.concat(plotIdx[plotIdx.length - 1] + 1));
    } else {
      setPlotIdx([0]);
    }
  };

  const handleDelClick = (key: number) => {
    return () => {
      const newIdx = plotIdx.filter((x) => x != key);
      const newButtom = newIdx.reduce((prev, current) => {
        prev[current] = buttomPos[current];
        return prev;
      }, {});

      setPlotIdx(newIdx);
      setButtomPos(newButtom);
    };
  };

  const handleDrag = (key: number) => {
    return (pos: { x: number; y: number }) => {
      const b = Object.assign({}, buttomPos);
      b[key] = pos.y;
      setButtomPos(b);
    };
  };

  const handleCloseAll = () => {
    setPlotIdx([]);
    setButtomPos({});
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item>
          <Button variant="outlined" color="primary" onClick={handleClick}>
            <Add />
            ADD PLOT
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="secondary" onClick={handleCloseAll}>
            <Close />
            CLOSE ALL
          </Button>
        </Grid>
      </Grid>
      <div>
        {plotIdx.map((idx, _) => {
          return (
            <PlotArea
              key={idx}
              plotData={props.dct}
              labels={labels}
              position={{ x: 0, y: Math.max(0, ...Object.values(buttomPos)) }}
              onDelClick={handleDelClick(idx)}
              onDrag={handleDrag(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};

export { PlotCollection, PlotData };
