import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Space,
  Card,
  Divider,
  Row,
  Col,
  Tag,
  Drawer,
  Tooltip,
  Badge,
  Statistic,
  Avatar,
  message
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  NumberOutlined,
  BankOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import paymentService from '../../services/paymentService/paymentService';

export default function PaymentManagement() {
  // Payment data state
  const [paymentsData, setPaymentsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filtering and drawers
  const [searchReference, setSearchReference] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = () => {
    setLoading(true);
    paymentService
      .getPayments(currentPage)
      .then((data) => {
        setPaymentsData(data.payments || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching payments');
        console.log(error);
        setLoading(false);
      });
  };

  const refreshState = () => {
    fetchPayments();
  };

  const paymentStatusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'processing', label: 'Processing' }
  ];

  const formatPaymentStatus = (status) => {
    const statusMap = {
      completed: { text: 'Completed', color: 'success' },
      pending: { text: 'Pending', color: 'warning' },
      failed: { text: 'Failed', color: 'error' },
      processing: { text: 'Processing', color: 'processing' }
    };

    return statusMap[status] || { text: status, color: 'default' };
  };

  const formatPaymentMethod = (method) => {
    const methodMap = {
      paynow: { text: 'PayNow', color: 'blue' },
      ecocash: { text: 'EcoCash', color: 'green' },
      onemoney: { text: 'OneMoney', color: 'purple' },
      card: { text: 'Card', color: 'cyan' },
      bank: { text: 'Bank Transfer', color: 'orange' }
    };

    return methodMap[method] || { text: method, color: 'default' };
  };

  const filteredData = paymentsData.filter(
    (item) =>
      item?.referenceNumber?.toLowerCase().includes(searchReference.toLowerCase()) &&
      item.property?.propertyName?.toLowerCase().includes(searchProperty.toLowerCase()) &&
      (searchStatus === '' || item.status === searchStatus)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const columns = [
    {
      title: 'Reference',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      ellipsis: true
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => record?.property?.propertyName,
      sorter: (a, b) => a.property?.propertyName?.localeCompare(b.property?.propertyName)
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => `${record.user.firstName} ${record.user.lastName}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => `$${parseFloat(val).toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const paymentMethod = formatPaymentMethod(method);
        return <Tag color={paymentMethod.color}>{paymentMethod.text}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const paymentStatus = formatPaymentStatus(status);
        return <Badge status={paymentStatus.color} text={paymentStatus.text} />;
      },
      filters: paymentStatusOptions.map((option) => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => formatDate(record.createdAt),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <EyeOutlined
              onClick={() => {
                setSelectedPayment(record);
                setIsDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Reset Filters Function
  const resetFilters = () => {
    setSearchReference('');
    setSearchProperty('');
    setSearchStatus('');
    message.info('Filters have been reset');
  };

  return (
    <div className="p-4">
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Payments" 
              value={totalCount} 
              prefix={<TransactionOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Payments"
              value={paymentsData.filter((p) => p.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={paymentsData.filter((p) => p.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={paymentsData.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Input
            placeholder="Search by Reference"
            prefix={<SearchOutlined />}
            value={searchReference}
            onChange={(e) => setSearchReference(e.target.value)}
            style={{ width: 250 }}
          />
          <Input
            placeholder="Search by Property"
            prefix={<HomeOutlined />}
            value={searchProperty}
            onChange={(e) => setSearchProperty(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 220 }}
            onChange={(value) => setSearchStatus(value || '')}
            value={searchStatus || undefined}
            options={paymentStatusOptions}
          />

          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            Reset Filters
          </Button>

          <Button type="primary" icon={<ReloadOutlined />} onClick={refreshState}>
            Refresh
          </Button>
        </Space>

        <Divider />

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          style={{ padding: '20px' }}
          loading={loading}
          pagination={{
            pageSize: 10,
            total: totalCount,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Payment Details Drawer */}
      <Drawer
        title={
          <Space>
            <TransactionOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Payment Details</span>
          </Space>
        }
        placement="right"
        width={620}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '0' }}
      >
        {selectedPayment && (
          <div>
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: 'white',
                borderRadius: '0 0 8px 8px'
              }}
            >
              <Row align="middle" gutter={16}>
                <Col>
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <DollarOutlined style={{ fontSize: '24px' }} />
                  </div>
                </Col>
                <Col flex="auto">
                  <h2 style={{ color: 'white', margin: 0 }}>Payment Reference: {selectedPayment.referenceNumber}</h2>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color={formatPaymentMethod(selectedPayment.paymentMethod).color} style={{ borderRadius: '12px' }}>
                      {formatPaymentMethod(selectedPayment.paymentMethod).text}
                    </Tag>
                    <Badge
                      status={formatPaymentStatus(selectedPayment.status).color}
                      text={formatPaymentStatus(selectedPayment.status).text}
                      style={{ marginLeft: '8px', color: 'white' }}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Content Sections */}
            <div style={{ padding: '16px 24px' }}>
              {/* Payment Information Section */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: '8px'
                  }}
                >
                  <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Payment Information</span>
                </div>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Payment ID</div>
                      <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedPayment.id.slice(0, 8)}...</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Transaction ID</div>
                      <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedPayment.transactionId || 'N/A'}</div>
                    </div>
                  </Col>

                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Amount</span>}
                        value={selectedPayment.amount}
                        precision={2}
                        prefix={<DollarOutlined />}
                        suffix="USD"
                        valueStyle={{
                          color: '#1890ff',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Status</span>}
                        value={formatPaymentStatus(selectedPayment.status).text}
                        valueStyle={{
                          color: selectedPayment.status === 'completed' ? '#3f8600' : 
                                 selectedPayment.status === 'pending' ? '#faad14' : '#f5222d',
                          fontSize: '20px'
                        }}
                        prefix={selectedPayment.status === 'completed' ? <CheckCircleOutlined /> : 
                               selectedPayment.status === 'pending' ? <ClockCircleOutlined /> : <CloseCircleOutlined />}
                      />
                    </Card>
                  </Col>

                  <Col span={12}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Created At</span>
                      <span>{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Paid At</span>
                      <span>{formatDate(selectedPayment.paidAt)}</span>
                    </div>
                  </Col>

                  {selectedPayment.paymentDetails && (
                    <Col span={24}>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '12px',
                          borderRadius: '6px',
                          background: selectedPayment.paymentDetails.status === 'error' ? '#fff2f0' : '#f6ffed',
                          border: selectedPayment.paymentDetails.status === 'error' ? '1px solid #ffccc7' : '1px solid #b7eb8f'
                        }}
                      >
                        <div style={{ 
                          color: selectedPayment.paymentDetails.status === 'error' ? '#f5222d' : '#52c41a', 
                          marginBottom: '4px', 
                          fontWeight: '500' 
                        }}>
                          Payment Details
                        </div>
                        <div>
                          Status: {selectedPayment.paymentDetails.status}
                          {selectedPayment.paymentDetails.error && (
                            <div style={{ color: '#f5222d', marginTop: '4px' }}>
                              Error: {selectedPayment.paymentDetails.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Property Information Section */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: '8px'
                  }}
                >
                  <HomeOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Property Information</span>
                </div>

                <Card
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                    borderRadius: '6px',
                    background: 'linear-gradient(to right, #e6f7ff, #f9f9f9)'
                  }}
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={4}>
                      <Avatar size={64} icon={<HomeOutlined />} style={{ backgroundColor: '#13c2c2' }} />
                    </Col>
                    <Col span={20}>
                      <h3 style={{ margin: '0 0 8px 0' }}>
                        {selectedPayment?.property?.propertyName}
                      </h3>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>{selectedPayment?.property?.address}</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <NumberOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>Meter: {selectedPayment?.property?.meterNumber}</span>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </div>

              {/* User Information Section */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: '8px'
                  }}
                >
                  <UserOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>User Information</span>
                </div>

                <Card
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                    borderRadius: '6px',
                    background: 'linear-gradient(to right, #f9f0ff, #f9f9f9)'
                  }}
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={4}>
                      <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#722ed1' }} />
                    </Col>
                    <Col span={20}>
                      <h3 style={{ margin: '0 0 8px 0' }}>
                        {selectedPayment.user.firstName} {selectedPayment.user.lastName}
                      </h3>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MailOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>{selectedPayment.user.email}</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>{selectedPayment.user.phoneNumber}</span>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}