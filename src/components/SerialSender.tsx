import * as React from "react";
import { Button, Grid, TextField } from "@material-ui/core";

export const SerialSender = (props: { sender: (arg: string) => void }) => {
  const [value, setValue] = React.useState("");

  return (
    <Grid container>
      <Grid item>
        <TextField
          style={{ width: "400px" }}
          label="Output text"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setValue(event.target.value);
          }}
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          onClick={() => {
            props.sender?.(value);
          }}
        >
          Send
        </Button>
      </Grid>
    </Grid>
  );
};
