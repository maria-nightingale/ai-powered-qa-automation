#!/usr/bin/env node
/**
 * Attach screenshot files to a Jira issue via REST API.
 *
 * Requires in .env:
 *   ATLASSIAN_EMAIL (or JIRA_LOGIN_EMAIL)
 *   ATLASSIAN_API_TOKEN (or JIRA_API_TOKEN)
 *   ATLASSIAN_BASE_URL (or JIRA_SITE, default: legionqaschool.atlassian.net)
 *
 * Usage:
 *   node scripts/jira-attach-screenshots.mjs DS-173 path/to/a.png path/to/b.png
 *   node scripts/jira-attach-screenshots.mjs DS-173 $(node scripts/collect-failure-screenshots.mjs --latest)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const issueKey = process.argv[2];
const files = process.argv.slice(3).filter(Boolean);

function resolveSite() {
  const raw =
    process.env.JIRA_SITE ||
    process.env.ATLASSIAN_BASE_URL ||
    "https://legionqaschool.atlassian.net";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const site = resolveSite();
const email = process.env.ATLASSIAN_EMAIL || process.env.JIRA_LOGIN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN || process.env.JIRA_API_TOKEN;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!issueKey) {
  fail("Usage: node scripts/jira-attach-screenshots.mjs <issue-key> [png...]");
}

if (!email || !token) {
  fail(
    "Missing Jira credentials. Set ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN in .env (API token required).",
  );
}

if (files.length === 0) {
  fail("No screenshot files provided.");
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    fail(`File not found: ${file}`);
  }
  if (!file.toLowerCase().endsWith(".png")) {
    fail(`Only PNG screenshots are supported: ${file}`);
  }
}

const auth = Buffer.from(`${email}:${token}`).toString("base64");
const uploaded = [];

for (const file of files) {
  const buffer = fs.readFileSync(file);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/png" }), path.basename(file));

  const response = await fetch(`https://${site}/rest/api/3/issue/${issueKey}/attachments`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "X-Atlassian-Token": "no-check",
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    fail(
      `Failed to attach ${path.basename(file)} to ${issueKey}: HTTP ${response.status}\n${body}\n` +
        (response.status === 401
          ? "Hint: Jira Cloud requires an API token (ATLASSIAN_API_TOKEN), not your account password."
          : ""),
    );
  }

  const result = await response.json();
  uploaded.push(result[0]?.filename || path.basename(file));
  console.log(`Attached ${path.basename(file)} → ${issueKey}`);
}

console.log(`Done. ${uploaded.length} file(s) attached to ${issueKey}.`);
