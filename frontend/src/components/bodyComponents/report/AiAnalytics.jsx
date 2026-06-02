import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Chip, Skeleton,
  Alert, AlertTitle, IconButton, Avatar, Fade, Divider,
} from "@mui/material";
import {
  AutoAwesome, Send, TipsAndUpdates, Inventory2, TrendingUp,
  PeopleAlt, ShoppingCart, ContentCopy, Refresh, History
} from "@mui/icons-material";
import { generateAnalyticsInsight } from "../../../services/geminiService";

// ── Theme specific constants matching your dashboard ─────────
const THEME_BLUE = "#1976d2";
const BG_LIGHT_GREY = "#f4f6f8";
const BORDER_COLOR = "#e2e8f0";

// ── Prompt chip definitions ──────────────────────────────────
const PROMPT_CHIPS = [
  { label: "Show low stock products", icon: <Inventory2 fontSize="small" /> },
  { label: "Which product has highest stock?", icon: <TrendingUp fontSize="small" /> },
  { label: "Give me my top customers", icon: <PeopleAlt fontSize="small" /> },
  { label: "Summarize today's sales", icon: <ShoppingCart fontSize="small" /> },
  { label: "What products should I restock?", icon: <TipsAndUpdates fontSize="small" /> },
  { label: "Show revenue breakdown", icon: <TrendingUp fontSize="small" /> },
];

// ── Simple markdown renderer ─────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let inList = false;
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} style={{ margin: "12px 0", paddingLeft: 28, color: "#334155", fontSize: "1.05rem" }}>
          {listItems.map((li, i) => <li key={i} style={{ marginBottom: "8px", lineHeight: 1.7 }}>{formatInline(li)}</li>)}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (str) => {
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) parts.push(str.slice(lastIndex, match.index));
      parts.push(<strong key={match.index} style={{ color: "#0f172a", fontWeight: 700 }}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) parts.push(str.slice(lastIndex));
    return parts.length ? parts : str;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^[-*•]\s+/, ""));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
    } else {
      flushList();
      if (trimmed.startsWith("### ")) {
        elements.push(<Typography key={key++} variant="h6" fontWeight="700" color="#1e293b" mt={3} mb={1}>{formatInline(trimmed.slice(4))}</Typography>);
      } else if (trimmed.startsWith("## ")) {
        elements.push(<Typography key={key++} variant="h5" fontWeight="bold" color="#0f172a" mt={3.5} mb={1.5}>{formatInline(trimmed.slice(3))}</Typography>);
      } else if (trimmed.startsWith("# ")) {
        elements.push(<Typography key={key++} variant="h4" fontWeight="bold" color={THEME_BLUE} mt={4} mb={2}>{formatInline(trimmed.slice(2))}</Typography>);
      } else if (trimmed === "") {
        elements.push(<Box key={key++} sx={{ height: 12 }} />);
      } else {
        elements.push(<Typography key={key++} variant="body1" sx={{ fontSize: "1.05rem", lineHeight: 1.8, mb: 1, color: "#334155" }}>{formatInline(trimmed)}</Typography>);
      }
    }
  }
  flushList();
  return elements;
}

export default function AiAnalytics() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  // ── Fetch real dashboard context on mount ──────────────────
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const headers = { Authorization: `Bearer ${token}` };

        const [productsRes, ordersRes, customersRes] = await Promise.all([
          fetch("https://smart-inventory-management-system-backend.onrender.com/api/products", { headers }),
          fetch("https://smart-inventory-management-system-backend.onrender.com/api/orders", { headers }),
          fetch("https://smart-inventory-management-system-backend.onrender.com/api/customers", { headers }),
        ]);

        const products = productsRes.ok ? await productsRes.json() : [];
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const customers = customersRes.ok ? await customersRes.json() : [];

        setDashboardData({
          inventory: { totalProducts: products.length, products: products.slice(0, 50) },
          sales: { totalOrders: orders.length, orders: orders.slice(0, 50) },
          customers: { totalCustomers: customers.length, customers: customers.slice(0, 50) },
          generatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Context fetch failed:", err);
        setDashboardData({ note: "Could not load live data — AI will answer with limited context." });
      } finally {
        setDataLoading(false);
      }
    };
    fetchContext();
  }, []);

  // ── Ask the AI ─────────────────────────────────────────────
  const handleAskAI = async (overridePrompt) => {
    const question = overridePrompt || inputPrompt;
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    setAiResult("");

    try {
      const answer = await generateAnalyticsInsight(question, dashboardData || {});
      setAiResult(answer);
      setHistory((prev) => [{ question, answer, time: new Date() }, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.message || "Something went wrong while contacting the AI service.");
    } finally {
      setIsLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    }
  };

  const handleChipClick = (label) => {
    setInputPrompt(label);
    handleAskAI(label);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskAI(); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT_GREY, p: { xs: 3, md: 4 } }}>

      {/* ── Main Wrapper ── */}
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>

        {/* Top Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: THEME_BLUE, width: 56, height: 56 }}>
              <AutoAwesome sx={{ color: "#fff", fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800" color="#1e293b">
                AI Analytics
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                Ask anything about your inventory, sales & customers
              </Typography>
            </Box>
          </Box>

          {/* Data status chip */}
          <Chip
            icon={<AutoAwesome fontSize="small" />}
            label={dataLoading ? "Syncing Context..." : dashboardData?.inventory ? "Context Ready" : "Limited Context"}
            color={dataLoading ? "warning" : dashboardData?.inventory ? "success" : "default"}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.9rem", py: 2.5, px: 1, bgcolor: "#fff" }}
          />
        </Box>

        {/* Error / Demo Mode Banner */}
        {error && (
          <Fade in>
            <Alert severity={error.includes("DEMO MODE") ? "warning" : "error"} sx={{ mb: 4, borderRadius: 2, fontSize: "1rem" }}
              action={error.includes("DEMO MODE") ? null : <IconButton onClick={() => setError("")}>✕</IconButton>}
            >
              <AlertTitle sx={{ fontSize: "1.1rem", fontWeight: 600 }}>{error.includes("DEMO MODE") ? "Demo Mode" : "Error"}</AlertTitle>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Input Card */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4, border: `1px solid ${BORDER_COLOR}`, bgcolor: "#fff" }}>
          <Typography variant="subtitle1" color="#475569" mb={2.5} fontWeight={600} display="flex" alignItems="center" gap={1}>
            <TipsAndUpdates sx={{ color: "#f59e0b" }} /> Try a suggestion or type your own question
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
            {PROMPT_CHIPS.map((chip) => (
              <Chip key={chip.label} icon={chip.icon} label={chip.label} variant="outlined"
                onClick={() => handleChipClick(chip.label)}
                sx={{
                  borderRadius: 2, fontWeight: 500, fontSize: "0.95rem", py: 2.5, px: 0.5,
                  borderColor: BORDER_COLOR, color: "#475569",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "#f1f5f9", borderColor: THEME_BLUE, color: THEME_BLUE },
                }}
              />
            ))}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              fullWidth multiline maxRows={5} variant="outlined"
              placeholder="e.g. Which products are running low on stock?"
              value={inputPrompt} onChange={(e) => setInputPrompt(e.target.value)} onKeyDown={handleKeyDown}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2, bgcolor: "#f8fafc",
                  fontSize: "1.1rem", padding: "16px 20px",
                  "&.Mui-focused fieldset": { borderColor: THEME_BLUE, borderWidth: "2px" },
                },
              }}
            />
            <Button variant="contained" onClick={() => handleAskAI()} disabled={isLoading || !inputPrompt.trim()}
              sx={{
                minWidth: 64, height: 64, borderRadius: 2, bgcolor: THEME_BLUE,
                boxShadow: "none",
                "&:hover": { bgcolor: "#1565c0", boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)" },
                "&:disabled": { bgcolor: "#cbd5e1" },
              }}
            >
              <Send fontSize="large" />
            </Button>
          </Box>
        </Paper>

        {/* Loading Skeleton */}
        {isLoading && (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 3, mb: 4, border: `1px solid ${BORDER_COLOR}` }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <AutoAwesome sx={{ color: THEME_BLUE, fontSize: 32 }} />
              <Typography variant="h6" fontWeight={700} color={THEME_BLUE}>Analyzing your data…</Typography>
            </Box>
            <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="75%" height={32} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2, mt: 3 }} />
          </Paper>
        )}

        {/* AI Result */}
        {aiResult && !isLoading && (
          <Fade in>
            <Paper ref={resultRef} elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4, border: `1px solid ${BORDER_COLOR}` }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <AutoAwesome sx={{ color: THEME_BLUE, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#0f172a">Analysis Result</Typography>
                </Box>
                <Box>
                  <IconButton onClick={handleCopy} title="Copy" sx={{ mr: 1 }}><ContentCopy /></IconButton>
                  <IconButton onClick={() => handleAskAI()} title="Regenerate"><Refresh /></IconButton>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ color: "#334155" }}>
                {renderMarkdown(aiResult)}
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Recent History */}
        {history.length > 0 && !isLoading && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" color="#475569" mb={2.5} fontWeight={700} display="flex" alignItems="center" gap={1}>
              <History /> Recent Questions
            </Typography>
            {history.slice(0, 5).map((item, i) => (
              <Paper key={i} elevation={0} sx={{
                p: 2.5, mb: 2, borderRadius: 2, cursor: "pointer",
                border: `1px solid ${BORDER_COLOR}`, bgcolor: "#fff",
                transition: "all 0.2s", "&:hover": { borderColor: THEME_BLUE, bgcolor: "#f8fafc", transform: "translateY(-2px)" },
              }}
                onClick={() => { setInputPrompt(item.question); setAiResult(item.answer); }}
              >
                <Typography variant="subtitle1" fontWeight={600} color="#1e293b" noWrap>{item.question}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {item.time.toLocaleTimeString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}