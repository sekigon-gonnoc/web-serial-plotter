import * as React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";

const getOption = (str: string) => {
  return <MenuItem value={str}>{str}</MenuItem>;
};

export const BaudrateSelector = (props: {
  onChange: (val: string) => void;
  defaultBaud: string;
}) => {
  const [baud, setBaud] = React.useState(props.defaultBaud);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBaud(e.target.value);
    props.onChange(e.target.value);
  };
  return (
    <FormControl>
      <InputLabel id="label">Baurdrate</InputLabel>
      <Select labelId="label" value={baud} onChange={handleChange}>
        {getOption("raw_hid")}
        {getOption("1200")}
        {getOption("2400")}
        {getOption("4800")}
        {getOption("9600")}
        {getOption("19200")}
        {getOption("38400")}
        {getOption("57600")}
        {getOption("115200")}
        {getOption("230400")}
        {getOption("460800")}
        {getOption("921600")}
      </Select>
    </FormControl>
  );
};
