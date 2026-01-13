import { useContext } from "react";
import { AuthContext } from "../context/AuthContextDef";

export const useAuth = () => useContext(AuthContext);
