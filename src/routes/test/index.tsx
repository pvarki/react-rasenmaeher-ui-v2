import { useCheckCode } from "@/hooks/api/useCheckCode";
import { useLoginCodeStore } from "@/store/LoginCodeStore";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type RefObject } from "react";

export const Route = createFileRoute("/test/")({
  component: TestPage,
});

function TestPage() {
  /**
   * Temporary messy test page to check for proper business logic manually
   */

  interface ApiError extends Error {
    response?: {
      data?: {
        detail?: string;
      };
    };
  }

  const loginCodeStore = useLoginCodeStore();
  const [codeNotValid, setCodeNotValid] = useState(false);
  const inputCode: RefObject<string> = useRef("");

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      loginInput: { value: string };
    };

    checkCode(formElements.loginInput.value);
    inputCode.current = formElements.loginInput.value;
  }

  const { mutate: checkCode } = useCheckCode({
    onSuccess: (data) => {
      loginCodeStore.setCode(inputCode.current);
      if (data.isAdminCodeValid) {
        loginCodeStore.setCodeType("admin");
        console.log(`admin with code ${inputCode.current}`);
      } else if (data.isEnrollmentCodeValid) {
        loginCodeStore.setCodeType("user");
        console.log(`user with code ${inputCode.current}`);
      } else {
        loginCodeStore.setCodeType("unknown");
        setCodeNotValid(true);
        console.log(`unknown with code ${inputCode.current}`);
      }
    },
    onError: (err: ApiError) => {
      const errorMessage = err.response?.data?.detail || "Unknown error";
      console.log(errorMessage);
    },
  });

  return (
    <section className="prose dark:prose-invert">
      <h1 className="text-amber-800 text-2xl">
        Test Page for Implementing Business Logic
      </h1>
      <h2 className="text-lg text-amber-950">Check First Admin Creation</h2>
      <p>
        Follow readme instructions and create first admin code through CLI in
        container, input below and click "Submit".
      </p>
      <p>CODE NOT VALID: {`${codeNotValid}`}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginInput" className="pr-1">
            Login code:
          </label>
          <input
            id="loginInput"
            type="text"
            className="bg-slate-200 p-1 rounded"
          />
        </div>
        <button
          className="pl-1 pr-1 rounded bg-amber-700 text-white"
          type="submit"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
