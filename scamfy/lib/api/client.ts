/**
 * FastAPI Backend API Client Boundary
 */

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8000/api/v1";

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}
