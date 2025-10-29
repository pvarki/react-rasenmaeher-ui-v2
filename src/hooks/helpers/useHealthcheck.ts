import { useState, useEffect } from "react";

const useHealthCheck = () => {
  const [fqdn, setFqdn] = useState("");
  const [version, setVersion] = useState("");
  const [deployment, setDeployment] = useState("");

  interface HealthCheckResponse {
    dns: string;
    version: string;
    deployment: string;
  }

  useEffect(() => {
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
