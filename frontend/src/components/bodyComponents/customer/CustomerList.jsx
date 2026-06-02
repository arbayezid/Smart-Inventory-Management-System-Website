import React, { useState, useEffect } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]); // Store original data for filtering
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(""); // State for date filter

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Map orders to represent a customer visit
          // Filter out orders with no customer info (Unknown / N/A)
          const formattedData = data
            .filter((order) => {
              const name = order.customer?.name;
              const phone = order.customer?.phone;
              const hasName = name && name.trim() !== "" && name.trim().toLowerCase() !== "unknown";
              const hasPhone = phone && phone.trim() !== "" && phone.trim().toLowerCase() !== "n/a";
              return hasName || hasPhone; // at least one must be present
            })
            .map((order) => ({
              id: order._id,
              name: order.customer?.name || "Unknown",
              phone: order.customer?.phone || "N/A",
              date: new Date(order.createdAt).toLocaleDateString(), // Format date
              rawDate: new Date(order.createdAt),
              totalAmount: order.totalAmount || 0,
              status: order.status || "Completed",
            }));
          
          // Sort by date descending
          formattedData.sort((a, b) => b.rawDate - a.rawDate);
          
          setCustomers(formattedData);
          setAllCustomers(formattedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  }, []);

  // Handle Date Filter Change
  const handleDateFilterChange = (e) => {
    const selectedDate = e.target.value;
    setFilterDate(selectedDate);
    
    if (selectedDate) {
      const filtered = allCustomers.filter((item) => {
        // Convert input date (YYYY-MM-DD) to local date string format
        const itemDate = new Date(item.rawDate).toISOString().split('T')[0];
        return itemDate === selectedDate;
      });
      setCustomers(filtered);
    } else {
      setCustomers(allCustomers);
    }
  };

  const columns = [
    // {
    //   field: "id",
    //   headerName: "Customer ID",
    //   flex: 1.2,
    //   minWidth: 200,
    // },
    {
      field: "fullname",
      headerName: "Customer Name",
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => {
        const name = params.row.name || "Unknown";
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#1976d2",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight="500" color="#333">
              {name}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "mobile",
      headerName: "Mobile Number",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.phone || "N/A",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "totalAmount",
      headerName: "Amount",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.row.totalAmount || 0,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="#10b981">
          ${params.value.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "orderHistory",
      headerName: "Order Details",
      flex: 1,
      minWidth: 150,
      valueGetter: () => "N/A",
    },
  ];

  return (
    <Box
      sx={{
        m: 3,
        p: 3,
        bgcolor: "white",
        borderRadius: 2,
        height: "calc(100vh - 100px)", // সাদা বক্সটি স্ক্রিনের সমান ফিক্সড থাকবে
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" color="#333">
          Customers List
        </Typography>

        {/* Date Filter Input */}
        <input 
          type="date" 
          value={filterDate}
          onChange={handleDateFilterChange}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "14px"
          }}
        />
      </Box>

      {/* এখানে minHeight: 0 দেওয়া হয়েছে যাতে টেবিল ওভারফ্লো না করে */}
      <Box sx={{ flex: 1, width: "100%", minHeight: 0 }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
          }}
          pageSizeOptions={[15, 30, 50]}
          sx={{
            border: "none",
            height: "100%", // DataGrid কে বলা হয়েছে কন্টেইনারের ১০০% হাইট নিতে
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              borderBottom: "1px solid #eee",
              color: "#000",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold !important",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f9f9f9",
              color: "#555",
              fontSize: "14px",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f4f7fa",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
          }}
        />
      </Box>
    </Box>
  );
}