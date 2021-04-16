import * as React from "react";
import {
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
} from "@material-ui/core";

const PlotDataSelectorScatters = (props: {
  data: { dict: any };
  labels: string[];
  value: any;
  onUpdate: (arg0: any) => void;
}) => {
  const [labels, setLabels] = React.useState([]);
  const [trace, setTrace] = React.useState(props.value);

  React.useEffect(() => {
    setLabels(props.labels);
  }, [props.labels]);

  const handleChangeData = (axis: "x" | "y") => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      trace[axis] = props.data.dict[e.target.value];
      if (axis === "x") {
        trace.x_name = e.target.value;
      } else if (axis === "y") {
        trace.y_name = e.target.value;
      }
      trace.name = trace.x_name + "-" + trace.y_name;
      trace.mode = "scatters";
      setTrace(trace);
      props.onUpdate(trace);
    };
  };

  const getAxisName = (axis: "x" | "y") => {
    if (axis === "x") {
      return props.value.x_name;
    } else if (axis === "y") {
      return props.value.y_name;
    }
  };

  const listupData = (axis: "x" | "y") => {
    return (
      <FormControl>
        <InputLabel id="data">{axis.toUpperCase() + " Data"}</InputLabel>
        <Select
          labelId="data"
          value={labels.includes(getAxisName(axis)) ? getAxisName(axis) : ""}
          onChange={handleChangeData(axis)}
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
    setTrace(trace);
    props.onUpdate(trace);
  };

  const listupAxis = () => {
    return (
      <FormControl>
        <InputLabel id="yaxis">Y Axis</InputLabel>
        <Select
          labelId="yaxis"
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
        <Grid item xs={4}>
          {listupData("x")}
        </Grid>
        <Grid item xs={4}>
          {listupData("y")}
        </Grid>
        <Grid item xs={4}>
          {listupAxis()}
        </Grid>
      </Grid>
    </div>
  );
};

export { PlotDataSelectorScatters };
