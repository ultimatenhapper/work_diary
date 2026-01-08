import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import WorkDiary from "./WorkDiary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WorkDiary />
  </StrictMode>
);
