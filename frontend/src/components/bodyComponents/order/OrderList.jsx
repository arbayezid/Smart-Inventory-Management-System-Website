import { Avatar, Box, Button, Modal, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { Component } from "react";
import OrderModal from "./OrderModal";

export default class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: {},
      open: false,
      orders: [],
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/orders", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            ...item,
            id: item._id,
          }));
          this.setState({ orders: formattedData });
        }
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }

  handlOrderDetail = (order) => {
    console.log("the order is : ", order);
    this.setState({ order: order, open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const columns = [
      {
        field: "id",
        headerName: "ID",
        width: 220,
        description: "id of the product",
      },
      {
        field: "fullname",
        headerName: "Full Name",
        width: 300,
        description: "customer full name",
        renderCell: (params) => {
          const customerName = params.row.customer?.name || "Unknown";
          return (
            <>
              <Avatar alt="name" sx={{ width: 30, height: 30 }}>
                {customerName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle2" sx={{ mx: 3 }}>
                {customerName}
              </Typography>
            </>
          );
        },
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 200,
        description: "customer phone number",
        valueGetter: (params) => params.row.customer?.phone || "N/A",
      },
      {
        field: "total",
        headerName: "Total Amount",
        width: 200,
        description: "total amount of the order",
        valueGetter: (params) => "$" + (params.row.totalAmount || 0),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        description: "status of the order",
        valueGetter: (params) => params.row.status || "Pending",
      },
      {
        field: "details",
        headerName: "Order Details",
        width: 300,
        description: "the details of the order",

        renderCell: (params) => {
          const order = params.row;
          return (
            <Button
              variant="contained"
              sx={{ bgcolor: "#504099" }}
              onClick={() => this.handlOrderDetail(order)}
            >
              Order Details
            </Button>
          );
        },
      },
    ];

    return (
      <Box
        sx={{
          margin: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          height: "100%",
        }}
      >
        <DataGrid
          sx={{
            borderLeft: 0,
            borderRight: 0,
            borderRadius: 0,
          }}
          rows={this.state.orders}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[15, 20, 30]}
          rowSelection={false}
        />
        <Modal open={this.state.open} onClose={this.handleClose}>
          {/*  */}
          <Box>
            <OrderModal order={this.state.order} />
          </Box>
        </Modal>
      </Box>
    );
  }
}
