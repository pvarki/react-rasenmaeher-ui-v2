import { create } from "zustand";

type CodeType = "admin" | "user" | "unknown";

interface LoginCodeStore {
  code: string;
  codeType: CodeType;
  approveCode: string;

  setCode: (code: string) => void;
  setCodeType: (codeType: CodeType) => void;
  reset: () => void;
}

export const useLoginCodeStore = create<LoginCodeStore>((set) => ({
  code: "",
  codeType: "unknown",
  approveCode: "",

  setCode: (code: string) => set({ code }),
  setCodeType: (codeType: CodeType) => set({ codeType }),
  setApproveCode: (approveCode: string) => set({ approveCode }),
  reset: () => set({ code: "", codeType: "unknown" }),
}));
