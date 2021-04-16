import * as React from "react";
import Plot from "react-plotly.js";
import useInterval from "use-interval";
import { PlotDataSelector, PlotData, TraceData } from "./PlotDataSelector";
import { Button, IconButton, Popover, Grid } from "@material-ui/core";
import SettingIcon from "@material-ui/icons/Settings";
import CloseIcon from "@material-ui/icons/Close";
import { Rnd } from "react-rnd";

interface StreamPlotState extends TraceData {
  size: { width: string; height: string };
}

const StreamPlot = (props: StreamPlotState) => {
  const [revision, setRevision] = React.useState(0);
  const [trace, setTrace] = React.useState(props);
  const [dataLen, setDataLen] = React.useState(0);
  useInterval(() => {
    if (
      (props.data.length > 0 && props.data[0]?.y?.length != dataLen) ||
      trace !== props.data
    ) {
      setRevision(revision + 1);
      setTrace(props.data);
      setDataLen(props.data[0]?.y?.length);
    }
    /* } */
  }, 60);

  return (
    <Plot
      data={props.data}
      layout={{
        ...props.layout,
        datarevision: revision,
        showlegend: true,
        legend: { x: 1, y: 0.5 },
        yaxis: { side: "left" },
        yaxis2: { side: "right", overlaying: "y" },
        margin: { l: 30, b: 30, t: 30 },
        autosize: true,
      }}
      style={{ width: props.size.width, height: props.size.height }}
      revision={revision}
      onInitialized={(_figure) => {}}
      onUpdate={(_figure) => {}}
      useResizeHandler={true}
      onClick={(e) => {
        console.log("onClick", e);
        e.event.stopImmediatePropagation();
      }}
    />
  );
};

const PlotArea = (props: {
  plotData: PlotData;
  labels: string[];
  position: { x: number; y: number };
  onDelClick: () => void;
  onDrag: ({ x, y }) => void;
}) => {
  const [labels, setLabels] = React.useState(props.labels);
  const [trace, setTrace] = React.useState({
    data: [],
    layout: { margin: { l: 30, b: 30, t: 30 } },
  });
  const [rnd, setRnd] = React.useState({
    width: window.innerWidth - 30,
    height: 300,
    x: props.position.x,
    y: props.position.y,
  });

  React.useEffect(() => {
    if (labels.length == 0 && props.labels.length > 0) {
      const newTrace = {
        ...trace,
        data: props.labels.map((x) => {
          return { y: props.plotData.dict[x], name: x };
        }),
      };
      setTrace(newTrace);
    }
    setLabels(props.labels);
    props.onDrag({ x: 0, y: rnd.y + rnd.height });
  }, [props.labels]);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Rnd
      position={{ x: rnd.x, y: rnd.y }}
      size={{ width: rnd.width, height: rnd.height }}
      style={{ border: "solid 1px #ddd" }}
      minHeight={40}
      dragHandleClassName="dragHandle"
      onDragStop={(_e, d) => {
        setRnd({ ...rnd, x: d.x, y: d.y });
        props.onDrag({ x: 0, y: d.y + rnd.height });
      }}
      onResizeStop={(_e, _direction, ref, _delta, _position) => {
        setRnd({
          ...rnd,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        props.onDrag({ x: 0, y: rnd.y + ref.offsetHeight });
      }}
    >
      <Grid
        container
        spacing={0}
        justify="flex-end"
        className="dragHandle"
        style={{ background: "#eee" }}
      >
        <Grid item xs={3}>
          <IconButton aria-describedby={id} onClick={handleClick}>
            <SettingIcon />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <PlotDataSelector
              data={props.plotData}
              labels={labels}
              onUpdate={(data: TraceData) => {
                setTrace(Object.assign({}, data));
              }}
              plots={trace.data}
            />
          </Popover>
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={3}>
          <div style={{ textAlign: "right" }}>
            <IconButton color="secondary" onClick={props.onDelClick}>
              <CloseIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <StreamPlot
        data={trace.data}
        layout={trace.layout}
        size={{
          width: (rnd.width - 10).toString() + "px",
          height: (rnd.height - 50).toString() + "px",
        }}
      />
    </Rnd>
  );
};

export { PlotArea, PlotData };
