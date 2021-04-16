import * as React from "react";
import {
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from "@material-ui/core";

const PlotDataSelectorLines = (props: {
  data: { dict: any };
  labels: string[];
  value: any;
  onUpdate: (arg0: any) => void;
}) => {
  const [labels, setLabels] = React.useState(props.labels);
  const [trace, setTrace] = React.useState(props.value);

  React.useEffect(() => {
    setLabels(props.labels);
  }, [props.labels]);

  const handleChangeData = (e: React.ChangeEvent<HTMLSelectElement>) => {
    trace.y = props.data.dict[e.target.value];
    delete trace.x;
    trace.name = e.target.value;
    setTrace(trace);
    props.onUpdate(trace);
  };

  const listupData = () => {
    return (
      <FormControl>
        <InputLabel id="labelData">Y Data</InputLabel>
        <Select
          labelId={"labelData"}
          value={labels.includes(props.value.name) ? props.value.name : ""}
          onChange={handleChangeData}
        >
          {labels.map((k, idx) => {
            return (
              <MenuItem value={k} key={idx}>
                {k}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  const handleChangeAxis = (e: React.ChangeEvent<HTMLSelectElement>) => {
    trace.yaxis = e.target.value;
    delete trace.x;
    setTrace(trace);
    props.onUpdate(trace);
  };

  const listupAxis = () => {
    return (
      <FormControl>
        <InputLabel id="axisData">Y Axis</InputLabel>
        <Select
          labelId="axisData"
          value={props.value.yaxis ?? "y"}
          onChange={handleChangeAxis}
        >
          <MenuItem value="y">Y1</MenuItem>
          <MenuItem value="y2">Y2</MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <div>
      <Grid container spacing={5}>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
          {listupData()}
        </Grid>
        <Grid item xs={4}>
          {listupAxis()}
        </Grid>
      </Grid>
    </div>
  );
};

export { PlotDataSelectorLines };
