"use client"

import { useEffect, useState } from "react"
import { Layout, Card, Row, Col, Typography, Table, Tag, Statistic, Avatar, Divider, Space, message } from "antd"
import {
  DollarOutlined,
  DropboxOutlined,
  HomeOutlined,
  ShopOutlined,
  BankOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import dayjs from "dayjs"
import dashboardService from "../../services/dashboardService/dashboardService"

const { Header, Content } = Layout
const { Title } = Typography

// Initial empty state structure that matches your API response
const initialState = {
  summary: {
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    totalConsumption: 0,
    averageRevenuePerProperty: 0,
    averageConsumptionPerProperty: 0,
  },
  revenueByPropertyType: [],
  consumptionByPropertyType: [],
  monthlyRevenue: [],
  monthlyConsumption: [],
  recentPayments: [],
  topConsumers: [],
}

export default function AdminDashboard() {
  const [data, setData] = useState(initialState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = () => {
    setLoading(true)
    dashboardService
      .getAdminData()
      .then((responseData) => {
        console.log("API Response:", responseData)
        if (responseData) {
          setData(responseData)
        } else {
          message.error("Received empty data from API")
        }
        setLoading(false)
      })
      .catch((error) => {
        message.error("Error fetching dashboard data")
        console.error("API Error:", error)
        setLoading(false)
      })
  }

  // Format property type for display
  const formatPropertyType = (type) => {
    if (!type) return "Unknown"
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get icon for property type
  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case "residential_low_density":
      case "residential_high_density":
        return <HomeOutlined />
      case "commercial":
        return <ShopOutlined />
      case "industrial":
        return <ShopOutlined />
      case "agricultural":
        return <EnvironmentOutlined />
      default:
        return <BankOutlined />
    }
  }

  // Get color for property type
  const getPropertyTypeColor = (type) => {
    switch (type) {
      case "residential_low_density":
        return "#1890ff"
      case "residential_high_density":
        return "#52c41a"
      case "commercial":
        return "#faad14"
      case "industrial":
        return "#f5222d"
      case "agricultural":
        return "#722ed1"
      default:
        return "#13c2c2"
    }
  }

  // Prepare data for revenue chart - with null checks
  const revenueChartData =
    data.revenueByPropertyType?.map((item) => ({
      name: formatPropertyType(item.propertyType),
      value: item.totalRevenue || 0,
      color: getPropertyTypeColor(item.propertyType),
    })) || []

  // Prepare data for consumption pie chart - with null checks
  const consumptionPieData =
    data.consumptionByPropertyType
      ?.filter((item) => (item.totalConsumption || 0) > 0)
      .map((item) => ({
        name: formatPropertyType(item.propertyType),
        value: item.totalConsumption || 0,
        color: getPropertyTypeColor(item.propertyType),
      })) || []

  // Prepare data for monthly consumption chart - with null checks
  const monthlyConsumptionData =
    data.monthlyConsumption?.map((item) => ({
      name: dayjs(item.month).format("MMM YYYY"),
      value: item.totalConsumption || 0,
    })) || []

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
          <p style={{ margin: 0 }}>{`${label || payload[0].name}: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      )
    }
    return null
  }

  // Configure columns for recent payments table
  const paymentsColumns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{`${user?.firstName || ""} ${user?.lastName || ""}`}</span>
        </Space>
      ),
    },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (property) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{property?.propertyName || "Unknown Property"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{property?.address || "No address"}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <span style={{ fontWeight: "bold" }}>${(amount || 0).toFixed(2)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "completed" ? "green" : "orange"}
          icon={status === "completed" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {(status || "PENDING").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (paidAt) => (paidAt ? dayjs(paidAt).format("MMM DD, YYYY HH:mm") : "Pending"),
    },
  ]

  // Configure columns for top consumers table
  const consumersColumns = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      render: (property) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{property?.propertyName || "Unknown Property"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{property?.address || "No address"}</div>
        </div>
      ),
    },
    {
      title: "Owner",
      dataIndex: "property",
      key: "owner",
      render: (property) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{`${property?.owner?.firstName || ""} ${property?.owner?.lastName || ""}`}</span>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "property",
      key: "propertyType",
      render: (property) => (
        <Tag icon={getPropertyTypeIcon(property?.propertyType)} color={getPropertyTypeColor(property?.propertyType)}>
          {formatPropertyType(property?.propertyType)}
        </Tag>
      ),
    },
    {
      title: "Consumption",
      dataIndex: "total_consumption",
      key: "total_consumption",
      render: (consumption) => <span style={{ fontWeight: "bold" }}>{(consumption || 0).toFixed(2)} units</span>,
      sorter: (a, b) => (a.total_consumption || 0) - (b.total_consumption || 0),
      defaultSortOrder: "descend",
    },
  ]

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <DropboxOutlined style={{ fontSize: "24px", color: "#1890ff", marginRight: "10px" }} />
          <Title level={3} style={{ margin: 0 }}>
            Utility Management Dashboard
          </Title>
        </div>
      </Header>

      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        {/* Summary Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading} style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <Statistic
                title="Total Revenue"
                value={data?.summary?.totalRevenue || 0}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix={<DollarOutlined />}
                suffix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading} style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <Statistic
                title="Total Consumption"
                value={data?.summary?.totalConsumption || 0}
                precision={2}
                valueStyle={{ color: "#1890ff" }}
                prefix={<DropboxOutlined />}
                suffix="units"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading} style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <Statistic
                title="Total Users"
                value={data?.summary?.totalUsers || 0}
                valueStyle={{ color: "#722ed1" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading} style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <Statistic
                title="Total Properties"
                value={data?.summary?.totalProperties || 0}
                valueStyle={{ color: "#fa8c16" }}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              loading={loading}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DollarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                  <span>Revenue by Property Type</span>
                </div>
              }
              bordered={false}
              style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="value" name="Revenue" fill="#1890ff">
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    No revenue data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              loading={loading}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DropboxOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                  <span>Consumption by Property Type</span>
                </div>
              }
              bordered={false}
              style={{ height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                {consumptionPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consumptionPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {consumptionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    No consumption data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Monthly Consumption Chart */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              loading={loading}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DropboxOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                  <span>Monthly Consumption Trend</span>
                </div>
              }
              bordered={false}
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                {monthlyConsumptionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyConsumptionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Consumption"
                        stroke="#1890ff"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    No monthly consumption data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Tables Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              loading={loading}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DollarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                  <span>Recent Payments</span>
                </div>
              }
              bordered={false}
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
            >
              <Table
                dataSource={data.recentPayments || []}
                columns={paymentsColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                style={{ overflowX: "auto" }}
                locale={{ emptyText: "No payment data available" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              loading={loading}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DropboxOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                  <span>Top Consumers</span>
                </div>
              }
              bordered={false}
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
            >
              <Table
                dataSource={data.topConsumers || []}
                columns={consumersColumns}
                rowKey="propertyId"
                pagination={{ pageSize: 5 }}
                style={{ overflowX: "auto" }}
                locale={{ emptyText: "No consumer data available" }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
