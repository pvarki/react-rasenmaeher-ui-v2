import { useContext } from "react";
import { UserTypeContext } from "./userTypeContext";

export function useUserType() {
  return useContext(UserTypeContext);
}
