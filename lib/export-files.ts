export type ExportCell = string | number | boolean | null | undefined
export type ExportRow = Record<string, ExportCell>

export type ExportDataset = {
  name: string
  rows: ExportRow[]
}

export type ExportKpi = {
  label: string
  value: string
  detail?: string
}

export type ExportChartSection = {
  title: string
  points: {
    label: string
    value: number
    secondary?: string
  }[]
}

export type ExportReportPayload = {
  title: string
  subtitle?: string
  filename: string
  filters?: Record<string, string>
  kpis?: ExportKpi[]
  datasets: ExportDataset[]
  charts?: ExportChartSection[]
}

export function downloadCsvReport(payload: ExportReportPayload) {
  const lines = [
    [payload.title],
    payload.subtitle ? [payload.subtitle] : [],
    [],
    ["Filters"],
    ...objectRows(payload.filters ?? {}),
    [],
    ["KPI Summary"],
    ["Metric", "Value", "Detail"],
    ...(payload.kpis ?? []).map((kpi) => [kpi.label, kpi.value, kpi.detail ?? ""]),
    [],
    ...payload.datasets.flatMap((dataset) => [
      [dataset.name],
      ...toCsvRows(dataset.rows),
      [],
    ]),
  ]

  downloadBlob(
    new Blob([toCsv(lines)], { type: "text/csv;charset=utf-8" }),
    `${payload.filename}.csv`
  )
}

export function downloadXlsxReport(payload: ExportReportPayload) {
  const sheets = [
    {
      name: "KPI Summary",
      rows: [
        ["Metric", "Value", "Detail"],
        ...(payload.kpis ?? []).map((kpi) => [
          kpi.label,
          kpi.value,
          kpi.detail ?? "",
        ]),
        [],
        ["Filters"],
        ...objectRows(payload.filters ?? {}),
      ],
    },
    ...payload.datasets.map((dataset) => ({
      name: dataset.name,
      rows: toCsvRows(dataset.rows),
    })),
  ]

  downloadBlob(createXlsxBlob(sheets), `${payload.filename}.xlsx`)
}

export async function downloadPdfReport(payload: ExportReportPayload) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
  const margin = 42
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = margin

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const heading = (text: string) => {
    ensureSpace(34)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(text, margin, y)
    y += 22
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text(payload.title, margin, y)
  y += 28

  if (payload.subtitle) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(doc.splitTextToSize(payload.subtitle, pageWidth - margin * 2), margin, y)
    y += 24
  }

  doc.setTextColor(15, 23, 42)
  heading("Selected Filters")
  y = drawKeyValueRows(doc, objectRows(payload.filters ?? {}), y, margin)

  heading("KPI Summary")
  y = drawKpiCards(doc, payload.kpis ?? [], y, margin, pageWidth)

  if (payload.charts?.length) {
    heading("Chart Summary")
    for (const chart of payload.charts) {
      ensureSpace(112)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(chart.title, margin, y)
      y += 16
      y = drawBarSummary(doc, chart.points, y, margin, pageWidth - margin * 2)
      y += 10
    }
  }

  for (const dataset of payload.datasets) {
    heading(dataset.name)
    y = drawTable(doc, dataset.rows.slice(0, 24), y, margin, pageWidth)
    if (dataset.rows.length > 24) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Showing first 24 rows in PDF. CSV and Excel include all ${dataset.rows.length} filtered rows.`,
        margin,
        y
      )
      doc.setTextColor(15, 23, 42)
      y += 18
    }
  }

  downloadBlob(doc.output("blob"), `${payload.filename}.pdf`)
}

function drawKeyValueRows(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  rows: string[][],
  y: number,
  margin: number
) {
  doc.setFontSize(9)
  for (const row of rows.length ? rows : [["Range", "Not selected"]]) {
    doc.setFont("helvetica", "bold")
    doc.text(row[0], margin, y)
    doc.setFont("helvetica", "normal")
    doc.text(row[1] ?? "", margin + 150, y)
    y += 16
  }

  return y + 8
}

function drawKpiCards(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  kpis: ExportKpi[],
  y: number,
  margin: number,
  pageWidth: number
) {
  const columns = 4
  const gap = 10
  const width = (pageWidth - margin * 2 - gap * (columns - 1)) / columns
  const height = 58

  kpis.forEach((kpi, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = margin + column * (width + gap)
    const cardY = y + row * (height + gap)

    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(x, cardY, width, height, 8, 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(kpi.label, x + 10, cardY + 16)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(15, 23, 42)
    doc.text(kpi.value, x + 10, cardY + 36)
    if (kpi.detail) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text(kpi.detail.slice(0, 42), x + 10, cardY + 50)
    }
  })

  doc.setTextColor(15, 23, 42)
  return y + Math.ceil(Math.max(kpis.length, 1) / columns) * (height + gap) + 8
}

function drawBarSummary(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  points: ExportChartSection["points"],
  y: number,
  margin: number,
  width: number
) {
  const max = Math.max(...points.map((point) => point.value), 1)
  const barX = margin + 150
  const barWidth = width - 210

  doc.setFontSize(8)
  for (const point of points.slice(0, 8)) {
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    doc.text(point.label, margin, y)
    doc.setFillColor(91, 61, 245)
    doc.roundedRect(barX, y - 8, (point.value / max) * barWidth, 8, 4, 4, "F")
    doc.setTextColor(15, 23, 42)
    doc.text(`${point.value}${point.secondary ? ` / ${point.secondary}` : ""}`, barX + barWidth + 8, y)
    y += 16
  }

  return y
}

function drawTable(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  rows: ExportRow[],
  y: number,
  margin: number,
  pageWidth: number
) {
  if (!rows.length) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("No rows for the selected filters.", margin, y)
    return y + 20
  }

  const headers = Object.keys(rows[0])
  const columnWidth = (pageWidth - margin * 2) / headers.length
  const rowHeight = 18

  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  headers.forEach((header, index) => {
    doc.text(header, margin + index * columnWidth, y)
  })
  y += rowHeight

  doc.setFont("helvetica", "normal")
  rows.forEach((row) => {
    headers.forEach((header, index) => {
      doc.text(String(row[header] ?? "").slice(0, 24), margin + index * columnWidth, y)
    })
    y += rowHeight
  })

  return y + 8
}

function objectRows(value: Record<string, string>) {
  return Object.entries(value).map(([key, content]) => [key, content])
}

function toCsvRows(rows: ExportRow[]) {
  if (!rows.length) {
    return []
  }

  const headers = Object.keys(rows[0])
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
}

function toCsv(rows: ExportCell[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "")
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(",")
    )
    .join("\n")
}

function createXlsxBlob(sheets: { name: string; rows: ExportCell[][] }[]) {
  const safeSheets = sheets.map((sheet, index) => ({
    name: sanitizeSheetName(sheet.name || `Sheet ${index + 1}`),
    rows: sheet.rows.length ? sheet.rows : [["No data"]],
  }))

  const files = [
    {
      name: "[Content_Types].xml",
      content: contentTypesXml(safeSheets.length),
    },
    {
      name: "_rels/.rels",
      content: relsXml(),
    },
    {
      name: "xl/workbook.xml",
      content: workbookXml(safeSheets.map((sheet) => sheet.name)),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: workbookRelsXml(safeSheets.length),
    },
    {
      name: "xl/styles.xml",
      content: stylesXml(),
    },
    ...safeSheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: sheetXml(sheet.rows),
    })),
  ]

  return new Blob([createZip(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

function sheetXml(rows: ExportCell[][]) {
  const body = rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map((cell, columnIndex) => cellXml(cell, columnIndex, rowIndex))
          .join("")}</row>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`
}

function cellXml(cell: ExportCell, columnIndex: number, rowIndex: number) {
  const ref = `${columnName(columnIndex + 1)}${rowIndex + 1}`

  if (typeof cell === "number" && Number.isFinite(cell)) {
    return `<c r="${ref}"><v>${cell}</v></c>`
  }

  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(cell ?? ""))}</t></is></c>`
}

function workbookXml(sheetNames: string[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetNames.map((name, index) => `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`
}

function workbookRelsXml(sheetCount: number) {
  const sheets = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  ).join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets}<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
}

function contentTypesXml(sheetCount: number) {
  const sheets = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets}</Types>`
}

function relsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Inter"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf xfId="0"/></cellXfs></styleSheet>`
}

function createZip(files: { name: string; content: string }[]) {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)
    const localHeader = new Uint8Array(30 + name.length)
    const local = new DataView(localHeader.buffer)
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0, true)
    local.setUint16(8, 0, true)
    local.setUint16(10, 0, true)
    local.setUint16(12, 0, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, name.length, true)
    local.setUint16(28, 0, true)
    localHeader.set(name, 30)
    localParts.push(localHeader, data)

    const centralHeader = new Uint8Array(46 + name.length)
    const central = new DataView(centralHeader.buffer)
    central.setUint32(0, 0x02014b50, true)
    central.setUint16(4, 20, true)
    central.setUint16(6, 20, true)
    central.setUint16(8, 0, true)
    central.setUint16(10, 0, true)
    central.setUint16(12, 0, true)
    central.setUint16(14, 0, true)
    central.setUint32(16, crc, true)
    central.setUint32(20, data.length, true)
    central.setUint32(24, data.length, true)
    central.setUint16(28, name.length, true)
    central.setUint16(30, 0, true)
    central.setUint16(32, 0, true)
    central.setUint16(34, 0, true)
    central.setUint16(36, 0, true)
    central.setUint32(38, 0, true)
    central.setUint32(42, offset, true)
    centralHeader.set(name, 46)
    centralParts.push(centralHeader)

    offset += localHeader.length + data.length
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)

  return concatUint8Arrays([...localParts, ...centralParts, end])
}

function concatUint8Arrays(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0

  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }

  return output
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return crc >>> 0
})

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function columnName(index: number) {
  let name = ""
  while (index > 0) {
    const remainder = (index - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    index = Math.floor((index - 1) / 26)
  }
  return name
}

function sanitizeSheetName(value: string) {
  return value.replace(/[\\/?*[\]:]/g, " ").slice(0, 31)
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
