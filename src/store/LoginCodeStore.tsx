import { create } from "zustand";

interface LoginCodeStore {
  code: string;
  codeType: "admin" | "user" | "unknown" | null;
  setCode: (code: string) => void;
  setCodeType: (type: "admin" | "user" | "unknown" | null) => void;
  reset: () => void;
}

export const useLoginCodeStore = create<LoginCodeStore>((set) => ({
  code: "",
  codeType: null,
  setCode: (code) => set({ code }),
  setCodeType: (codeType) => set({ codeType }),
  reset: () => set({ code: "", codeType: null }),
}));
