"use client";

import * as React from "react";
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#1976d2",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "dark" ? theme.palette.grey[600] : theme.palette.grey[300],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "dark" ? 0.3 : 0.5,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "dark" ? "#39393D" : "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export interface SwitchProps extends Omit<MuiSwitchProps, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

function Switch({
  checked,
  onCheckedChange,
  onChange,
  className,
  ...props
}: SwitchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(checked);
    }
    if (onChange) {
      onChange(event, checked);
    }
  };

  return (
    <StyledSwitch
      checked={checked}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}

export { Switch };
