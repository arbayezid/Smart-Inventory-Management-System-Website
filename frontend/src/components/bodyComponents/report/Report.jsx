import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { getReportData } from "../../../services/dashboardApi";

// ─── CSV Export Utility ──────────────────────────────────────
const exportToCSV = (columns, rows, filename = "report.csv") => {
  if (!rows || rows.length === 0) return;

  const keys = Object.keys(rows[0]);
  const header = columns.join(",");
  const csvRows = rows.map((row) =>
    keys.map((key) => {
      const val = String(row[key] ?? "");
      // Escape commas and quotes in values
      return val.includes(",") || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(",")
  );

  const csvContent = [header, ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ─── Column configs for each report type ─────────────────────
const ITEM_SALES_KEYS = [
  "itemName", "stockCode", "qtySold",
  "category", "supplier", "stockLevel", "price", "cost", "profit", "margin",
];

const INVENTORY_STATUS_KEYS = [
  "productName", "sku", "category", "supplier",
  "currentStock", "price", "stockValue", "status",
];

const PROFIT_REPORT_KEYS = [
  "month", "totalRevenue", "totalCost", "grossProfit", "margin", "orderCount",
];

const Reports = () => {
  const [reportType, setReportType] = useState("Item Sales");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const printRef = useRef(null);

  // ─── Fetch report on mount (initial load) ─────────────────
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportData(reportType, fromDate || undefined, toDate || undefined);
      setReportData(data);
    } catch (err) {
      setError(err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, fromDate, toDate]);

  useEffect(() => {
    fetchReport();
  }, []); // Load on mount only; user clicks "Generate" for subsequent fetches

  // ─── Determine active columns and keys ─────────────────────
  const getKeysForType = (type) => {
    if (type === "Inventory Status") return INVENTORY_STATUS_KEYS;
    if (type === "Profit Report") return PROFIT_REPORT_KEYS;
    return ITEM_SALES_KEYS;
  };

  // ─── Format cell value for display ─────────────────────────
  const formatCellValue = (key, value) => {
    if (["price", "cost", "profit", "totalRevenue", "totalCost", "grossProfit", "stockValue"].includes(key)) {
      return `$${Number(value).toFixed(2)}`;
    }
    if (key === "margin") return `${value}%`;
    return value;
  };

  // ─── Print handler ─────────────────────────────────────────
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportData?.reportType || "Report"} - Smart Inventory</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h2>${reportData?.reportType || "Report"}</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // ─── CSV handler ───────────────────────────────────────────
  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;
    const filename = `${reportData.reportType.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(reportData.columns, reportData.rows, filename);
  };

  const activeKeys = getKeysForType(reportData?.reportType || reportType);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Reports Overview
      </Typography>

      {/* Filter and Export Section */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Filter" }}
            >
              <MenuItem value="Item Sales">Item Sales</MenuItem>
              <MenuItem value="Inventory Status">Inventory Status</MenuItem>
              <MenuItem value="Profit Report">Profit Report</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            type="date"
            label="From Date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            type="date"
            label="To Date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            fullWidth
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleExportCSV}
            disabled={!reportData || !reportData.rows || reportData.rows.length === 0}
          >
            Export as CSV
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePrint}
            disabled={!reportData || !reportData.rows || reportData.rows.length === 0}
          >
            Print Report
          </Button>
        </Grid>
      </Grid>

      {/* Error State */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body1">{error}</Typography>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* Table Section */}
      {!loading && reportData && reportData.rows && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {reportData.reportType} Report
            </Typography>
            <div ref={printRef}>
              <Table>
                <TableHead>
                  <TableRow>
                    {(reportData.columns || []).map((col, i) => (
                      <TableCell key={i}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={reportData.columns?.length || 1} align="center">
                        <Typography color="textSecondary" py={3}>
                          No data found for the selected filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.rows.map((row, index) => (
                      <TableRow key={index}>
                        {activeKeys.map((key, ki) => (
                          <TableCell key={ki}>
                            {formatCellValue(key, row[key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports;
