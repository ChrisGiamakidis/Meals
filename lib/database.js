import { createClient } from "@tursodatabase/serverless/compat";
import environment from "./environment";

const { loadLocalEnv, requireEnv } = environment;
loadLocalEnv();

export const db = createClient({
  url: requireEnv("TURSO_DATABASE_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

export function mapRows(result) {
  return result.rows.map((row) =>
    Object.fromEntries(
      result.columns.map((column, index) => [column, row[index]]),
    ),
  );
}
