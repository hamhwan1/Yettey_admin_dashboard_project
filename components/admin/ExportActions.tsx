"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

import {
  downloadCsvReport,
  downloadPdfReport,
  downloadXlsxReport,
  type ExportReportPayload,
} from "@/lib/export-files"
import AdminButton from "./AdminButton"

type ExportActionsProps = {
  payload: ExportReportPayload
}

export default function ExportActions({ payload }: ExportActionsProps) {
  const [loading, setLoading] = useState<"csv" | "xlsx" | "pdf" | null>(null)

  const run = async (type: "csv" | "xlsx" | "pdf") => {
    setLoading(type)
    try {
      if (type === "csv") {
        downloadCsvReport(payload)
      }

      if (type === "xlsx") {
        downloadXlsxReport(payload)
      }

      if (type === "pdf") {
        await downloadPdfReport(payload)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminButton
        variant="secondary"
        disabled={loading !== null}
        onClick={() => run("csv")}
      >
        <Download className="size-4" />
        {loading === "csv" ? "Exporting..." : "Export CSV"}
      </AdminButton>
      <AdminButton
        variant="secondary"
        disabled={loading !== null}
        onClick={() => run("xlsx")}
      >
        <FileSpreadsheet className="size-4" />
        {loading === "xlsx" ? "Exporting..." : "Export Excel"}
      </AdminButton>
      <AdminButton
        variant="primary"
        disabled={loading !== null}
        onClick={() => run("pdf")}
      >
        <FileText className="size-4" />
        {loading === "pdf" ? "Generating..." : "Download PDF"}
      </AdminButton>
    </div>
  )
}
