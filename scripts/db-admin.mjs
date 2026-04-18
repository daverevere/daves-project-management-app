#!/usr/bin/env node

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "projects.db");
const SNAPSHOT_DIR = path.join(DATA_DIR, "snapshots");
const PID_FILE = path.join(ROOT, ".dev-server.pid");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function ensurePaths() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function isDevServerRunning() {
  if (!fs.existsSync(PID_FILE)) return false;
  const raw = fs.readFileSync(PID_FILE, "utf8").trim();
  if (!raw) return false;
  const pid = Number(raw);
  if (!Number.isFinite(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function exportSnapshot(outputPath) {
  ensurePaths();
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found at ${DB_PATH}`);
  }
  const snapshotPath =
    outputPath ||
    path.join(SNAPSHOT_DIR, `projects.snapshot.${timestamp()}.db`);

  const db = new Database(DB_PATH);
  try {
    db.pragma("wal_checkpoint(FULL)");
    await db.backup(snapshotPath);
  } finally {
    db.close();
  }
  console.log(`Exported snapshot: ${snapshotPath}`);
}

function listSnapshots() {
  ensurePaths();
  const files = fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((file) => file.endsWith(".db"))
    .sort()
    .reverse();
  if (!files.length) {
    console.log("No snapshots found.");
    return;
  }
  for (const file of files) {
    const filePath = path.join(SNAPSHOT_DIR, file);
    const stat = fs.statSync(filePath);
    console.log(`${file} | ${stat.size} bytes | ${stat.mtime.toISOString()}`);
  }
}

async function importSnapshot(sourcePath, force) {
  ensurePaths();
  if (!sourcePath) {
    throw new Error("Provide snapshot path. Example: npm run db:import -- data/snapshots/your-file.db --force");
  }
  const resolvedSource = path.isAbsolute(sourcePath)
    ? sourcePath
    : path.join(ROOT, sourcePath);
  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Snapshot file not found: ${resolvedSource}`);
  }
  if (!force) {
    throw new Error("Import requires --force.");
  }
  if (isDevServerRunning()) {
    throw new Error("Dev server appears to be running. Stop it before import (npm run dev:stop).");
  }

  const preImportBackup = path.join(
    SNAPSHOT_DIR,
    `projects.pre-import.${timestamp()}.db`
  );
  const importTemp = path.join(DATA_DIR, `projects.import.${Date.now()}.db`);

  if (fs.existsSync(DB_PATH)) {
    const current = new Database(DB_PATH);
    try {
      current.pragma("wal_checkpoint(FULL)");
      await current.backup(preImportBackup);
    } finally {
      current.close();
    }
  }

  const source = new Database(resolvedSource, { readonly: true });
  try {
    await source.backup(importTemp);
  } finally {
    source.close();
  }

  const oldPath = `${DB_PATH}.old`;
  if (fs.existsSync(oldPath)) {
    fs.rmSync(oldPath);
  }
  if (fs.existsSync(DB_PATH)) {
    fs.renameSync(DB_PATH, oldPath);
  }
  fs.renameSync(importTemp, DB_PATH);
  if (fs.existsSync(oldPath)) {
    fs.rmSync(oldPath);
  }
  const wal = `${DB_PATH}-wal`;
  const shm = `${DB_PATH}-shm`;
  if (fs.existsSync(wal)) fs.rmSync(wal);
  if (fs.existsSync(shm)) fs.rmSync(shm);

  console.log(`Imported snapshot: ${resolvedSource}`);
  console.log(`Pre-import backup: ${preImportBackup}`);
}

async function main() {
  const [, , command, arg1, ...rest] = process.argv;
  const force = rest.includes("--force") || arg1 === "--force";
  try {
    if (command === "export") {
      await exportSnapshot(arg1 && arg1 !== "--force" ? arg1 : undefined);
      return;
    }
    if (command === "list") {
      listSnapshots();
      return;
    }
    if (command === "import") {
      await importSnapshot(arg1 && arg1 !== "--force" ? arg1 : undefined, force);
      return;
    }
    console.log("Usage:");
    console.log("  node scripts/db-admin.mjs export [output-path]");
    console.log("  node scripts/db-admin.mjs list");
    console.log("  node scripts/db-admin.mjs import <snapshot-path> --force");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

void main();
