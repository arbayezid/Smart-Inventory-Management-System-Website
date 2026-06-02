/**
 * Dashboard API Service Layer
 * 
 * Centralized fetch functions for all dashboard data.
 * All functions read the JWT token from localStorage and
 * hit the backend REST API at https://smart-inventory-management-system-backend.onrender.com.
 */

const API_BASE = "https://smart-inventory-management-system-backend.onrender.com/api";

/**
 * Helper: builds an authorized GET request and parses JSON.
 * Throws on non-ok responses so callers can catch uniformly.
 */
const authorizedGet = async (endpoint) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in.");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error ${res.status}`);
  }

  return res.json();
};

/**
 * Helper: authorized POST request.
 */
const authorizedPost = async (endpoint, body) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in.");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error ${res.status}`);
  }

  return res.json();
};

/**
 * Helper: authorized PUT request.
 */
const authorizedPut = async (endpoint, body) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in.");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error ${res.status}`);
  }

  return res.json();
};

/**
 * Helper: authorized DELETE request.
 */
const authorizedDelete = async (endpoint) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please log in.");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error ${res.status}`);
  }

  return res.json();
};

// ─── Product CRUD ─────────────────────────────────────────────
/**
 * Fetch all products for the authenticated shop.
 * Returns: Product[]
 */
export const getProducts = () => authorizedGet("/products");

/**
 * Fetch a single product by ID.
 * @param {string} id - MongoDB ObjectId
 */
export const getProduct = (id) => authorizedGet(`/products/${id}`);

/**
 * Create a new product.
 * @param {Object} productData - { name, sku, category, price, quantity, supplier?, description? }
 */
export const createProduct = (productData) => authorizedPost("/products", productData);

/**
 * Update an existing product.
 * @param {string} id          - MongoDB ObjectId of the product
 * @param {Object} productData - Fields to update
 * Returns: Updated product object
 */
export const updateProduct = (id, productData) => authorizedPut(`/products/${id}`, productData);

/**
 * Delete a product by ID.
 * @param {string} id - MongoDB ObjectId
 * Returns: { message: string }
 */
export const deleteProduct = (id) => authorizedDelete(`/products/${id}`);

// ─── Stat Cards ───────────────────────────────────────────────
/**
 * Fetches summary stats for the InfoCards row.
 * 
 * Response shape:
 * {
 *   productCount: number,
 *   orderCount: number,
 *   customerCount: number,
 *   pendingOrders: number,
 *   shippedOrders: number,
 *   deliveredOrders: number
 * }
 */
export const getDashboardStats = () => authorizedGet("/auth/dashboard");

// ─── Full Analytics Payload ───────────────────────────────────
/**
 * Fetches the combined analytics payload for all charts + table.
 * 
 * Response shape:
 * {
 *   salesData: {
 *     categories: string[],        // ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
 *     series: [
 *       { name: string, data: number[] },  // Current Week
 *       { name: string, data: number[] }   // Previous Week
 *     ],
 *     currentWeekTotal: number,
 *     previousWeekTotal: number
 *   },
 *   cityData: {
 *     labels: string[],   // city names
 *     series: number[]    // sale amounts per city
 *   },
 *   channelData: {
 *     categories: string[],
 *     series: [ { name: string, data: number[] }, ... ]
 *   },
 *   topProducts: [
 *     { name: string, price: number, quantity: number, amount: number }, ...
 *   ]
 * }
 */
export const getDashboardAnalytics = () =>
  authorizedGet("/auth/dashboard/analytics");

// ─── Individual Convenience Wrappers ──────────────────────────
// These unwrap the analytics payload so components can request
// only the slice of data they need.

/**
 * Sales over time — line chart data.
 * Returns: { categories, series, currentWeekTotal, previousWeekTotal }
 */
export const getSalesData = async () => {
  const { salesData } = await getDashboardAnalytics();
  return salesData;
};

/**
 * Sales by city — pie / donut chart data.
 * Returns: { labels, series }
 */
export const getCityData = async () => {
  const { cityData } = await getDashboardAnalytics();
  return cityData;
};

/**
 * Channel breakdown — stacked bar chart data.
 * Returns: { categories, series }
 */
export const getChannelData = async () => {
  const { channelData } = await getDashboardAnalytics();
  return channelData;
};

/**
 * Top selling products — table data.
 * Returns: [{ name, price, quantity, amount }, ...]
 */
export const getTopProducts = async () => {
  const { topProducts } = await getDashboardAnalytics();
  return topProducts;
};

// ─── Revenue Page ─────────────────────────────────────────────
/**
 * Fetches the full analytics payload for the Revenue page.
 *
 * Response shape:
 * {
 *   revenueCards: [{ isMoney, number, percentage, upOrDown, color, title, subTitle }],
 *   revenueCostChart: { categories: string[], series: [{ name, type, data: number[] }] },
 *   bestSellingWeekly: { categories: string[], series: [{ name, data: number[] }] },
 *   bestSellingYearly: { categories: string[], series: [{ data: number[] }] }
 * }
 */
export const getRevenueData = () =>
  authorizedGet("/auth/dashboard/revenue-analytics");

// ─── Growth Page ──────────────────────────────────────────────
/**
 * Fetches the full analytics payload for the Growth page.
 *
 * Response shape:
 * {
 *   growthCards: [{ isMoney, number, percentage, upOrDown, color, title, subTitle }],
 *   salesGrowthChart: { categories, series },
 *   productGrowthChart: { categories, series },
 *   customerGrowthChart: { categories, series },
 *   visitorsChart: { categories, series }
 * }
 */
export const getGrowthData = () =>
  authorizedGet("/auth/dashboard/growth-analytics");

// ─── Reports Page ─────────────────────────────────────────────
/**
 * Fetches filtered report data.
 *
 * @param {string} type   - "Item Sales" | "Inventory Status" | "Profit Report"
 * @param {string} [from] - ISO date string for start of range (e.g. "2024-01-01")
 * @param {string} [to]   - ISO date string for end of range   (e.g. "2024-12-31")
 *
 * Response shape:
 * {
 *   reportType: string,
 *   columns: string[],
 *   rows: object[]
 * }
 */
export const getReportData = (type = "Item Sales", from, to) => {
  const params = new URLSearchParams({ type });
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  return authorizedGet(`/auth/dashboard/reports?${params.toString()}`);
};
