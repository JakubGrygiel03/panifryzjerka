import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (!line || line.startsWith("#") || index < 1) continue;
  env[line.slice(0, index)] = line.slice(index + 1).replace(/^"|"$/g, "");
}

const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
const ref = host.split(".")[0];
const sql = readFileSync("supabase/migrations/20261008010000_accounts.sql", "utf8");
const client = new pg.Client({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  user: "postgres",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 12000,
});

await client.connect();
await client.query(sql);
await client.end();
console.log("account tables ready");
