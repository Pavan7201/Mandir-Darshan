import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { Switch, FormControlLabel, Box } from "@mui/material";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={theme === "dark"}
          onChange={toggleTheme}
          color="default"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: theme === 'dark' ? 'rgb(240, 230, 189)' : 'black',
            },
            '& .MuiSwitch-track': {
              backgroundColor: theme === 'dark' ? 'rgb(240, 230, 189)' : 'black',
            },
          }}
        />
      }
      label={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon /> }
        </Box>
      }
      labelPlacement="start"
      sx={{
        alignItems: "center",
      }}
    />
  );
};

export default ThemeToggle;
