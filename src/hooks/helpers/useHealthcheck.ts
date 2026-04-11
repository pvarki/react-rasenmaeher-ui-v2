import { useState, useEffect } from "react";

const isMock = import.meta.env.VITE_MOCK === "true";

const useHealthCheck = () => {
  const [fqdn, setFqdn] = useState(isMock ? "mock.pvarki.fi" : "");
  const [version, setVersion] = useState(isMock ? "0.0.0-mock" : "");
  const [deployment, setDeployment] = useState(isMock ? "localmaeher" : "");

  interface HealthCheckResponse {
    dns: string;
    version: string;
    deployment: string;
  }

  useEffect(() => {
    if (isMock) return; // skip fetch in mock mode

    fetch("/api/v1/healthcheck")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: HealthCheckResponse) => {
        setFqdn(data.dns);
        setVersion(data.version);
        setDeployment(data.deployment);
      })
      .catch((error) => {
        console.error("Failed to fetch health check data", error);
      });
  }, []);

  return { fqdn, version, deployment };
};

export default useHealthCheck;
