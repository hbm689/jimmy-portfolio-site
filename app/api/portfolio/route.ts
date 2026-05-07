import { NextResponse } from "next/server";

type SheetRow = Record<string, string>;

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function isEnabled(value: string | undefined) {
  const v = clean(value).toLowerCase();

  if (!v) return true;

  return ["true", "1", "yes", "y", "on"].includes(v);
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char !== "\r") {
        field += char;
      }
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function csvToRows(csv: string): SheetRow[] {
  const table = parseCsv(csv);

  if (table.length < 2) return [];

  const headers = table[0].map((header) => header.trim());

  return table
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const item: SheetRow = {};

      headers.forEach((header, index) => {
        item[header] = row[index] ?? "";
      });

      return item;
    });
}

async function fetchSheet(sheetName: string) {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID in .env.local");
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetName
  )}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${sheetName}`);
  }

  const text = await response.text();

  if (text.includes("<html") || text.includes("<!DOCTYPE html")) {
    throw new Error(
      `Google Sheet is not public or not published to web: ${sheetName}`
    );
  }

  return csvToRows(text)
    .filter((row) => isEnabled(row.enabled))
    .sort((a, b) => {
      const orderA = Number(clean(a.order) || 9999);
      const orderB = Number(clean(b.order) || 9999);
      return orderA - orderB;
    });
}

export async function GET() {
  try {
    const [videoRows, photoRows] = await Promise.all([
      fetchSheet("動態"),
      fetchSheet("平面"),
    ]);

    const videos = videoRows.map((row, index) => ({
      id: `video-${index}`,
      titleZh: clean(row.titleZh),
      titleEn: clean(row.titleEn),
      clientZh: clean(row.clientZh),
      clientEn: clean(row.clientEn),
      year: clean(row.year),
      categoryZh: clean(row.categoryZh),
      categoryEn: clean(row.categoryEn),
      roleZh: clean(row.roleZh),
      roleEn: clean(row.roleEn),
      url: clean(row.url),
      noteZh: clean(row.noteZh),
      noteEn: clean(row.noteEn),
    }));

    const photos = photoRows.map((row, index) => {
      const photoList = [
        clean(row.photo1),
        clean(row.photo2),
        clean(row.photo3),
        clean(row.photo4),
        clean(row.photo5),
        clean(row.photo6),
      ].filter(Boolean);

      return {
        id: `photo-${index}`,
        titleZh: clean(row.titleZh),
        titleEn: clean(row.titleEn),
        clientZh: clean(row.clientZh),
        clientEn: clean(row.clientEn),
        year: clean(row.year),
        categoryZh: clean(row.categoryZh),
        categoryEn: clean(row.categoryEn),
        roleZh: clean(row.roleZh),
        roleEn: clean(row.roleEn),
        cover: clean(row.cover) || photoList[0] || "",
        noteZh: clean(row.noteZh),
        noteEn: clean(row.noteEn),
        photos: photoList,
      };
    });

    return NextResponse.json(
      {
        videos,
        photos,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}