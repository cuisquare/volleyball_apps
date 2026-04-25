const fs = require("fs/promises");
const path = require("path");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function escapeCsvValue(value) {
  if (value == null) {
    return "";
  }
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function writeCsv(filePath, columns, rows) {
  const header = columns.map(escapeCsvValue).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column])).join(",")
  );
  const content = `${[header, ...lines].join("\n")}\n`;
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

module.exports = {
  writeCsv,
};
