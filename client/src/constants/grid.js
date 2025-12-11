import { themeQuartz } from "ag-grid-community";
export const darkTheme = themeQuartz.withParams({
  backgroundColor: "#1f2836",
  browserColorScheme: "dark",
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.07,
    onto: "backgroundColor",
  },
  foregroundColor: "#FFF",
  headerFontSize: 14,
});

export const lightTheme = themeQuartz.withParams({
  browserColorScheme: "light",
  headerFontSize: 14,
});
