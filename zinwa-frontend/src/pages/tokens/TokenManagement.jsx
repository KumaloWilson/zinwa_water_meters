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
  message,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  HomeOutlined,
  KeyOutlined,
  DollarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  NumberOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
// Import custom water droplet icon component
import { IoWaterOutline } from "react-icons/io5";

import tokenService from '../../services/tokenService/tokenService';

const { Title, Text } = Typography;

export default function TokenManagement() {
  // Token data state
  const [tokensData, setTokensData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filtering and drawers
  const [searchToken, setSearchToken] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, [currentPage]);

  const fetchTokens = () => {
    setLoading(true);
    tokenService
      .getTokens(currentPage)
      .then((data) => {
        setTokensData(data.tokens || data); // Handle both formats
        setTotalCount(data.totalCount || data.length || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching water tokens');
        console.log(error);
        setLoading(false);
      });
  };

  const refreshState = () => {
    fetchTokens();
  };

  const tokenStatusOptions = [
    { value: 'used', label: 'Used' },
    { value: 'unused', label: 'Unused' },
    { value: 'expired', label: 'Expired' }
  ];

  const formatTokenStatus = (isUsed, expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    if (isUsed) {
      return { text: 'Used', color: 'default' };
    } else if (expiry < now) {
      return { text: 'Expired', color: 'error' };
    } else {
      return { text: 'Active', color: 'success' };
    }
  };

  const filteredData = tokensData.filter(
    (item) =>
      (item?.tokenValue?.toLowerCase().includes(searchToken.toLowerCase()) || 
       item?.payment?.referenceNumber?.toLowerCase().includes(searchToken.toLowerCase())) &&
      (item?.property?.propertyName?.toLowerCase().includes(searchProperty.toLowerCase()) || 
       item?.property?.meterNumber?.toLowerCase().includes(searchProperty.toLowerCase())) &&
      (searchStatus === '' || 
       (searchStatus === 'used' && item.isUsed) ||
       (searchStatus === 'unused' && !item.isUsed) ||
       (searchStatus === 'expired' && !item.isUsed && new Date(item.expiresAt) < new Date()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const columns = [
    {
      title: 'Water Token',
      dataIndex: 'tokenValue',
      key: 'tokenValue',
      render: (text) => (
        <Text copyable strong style={{ fontFamily: 'monospace' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Water Volume',
      dataIndex: 'units',
      key: 'units',
      render: (units) => `${parseFloat(units).toFixed(2)} m³`,
      sorter: (a, b) => a.units - b.units
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => record?.property?.propertyName || 'N/A',
      sorter: (a, b) => a.property?.propertyName?.localeCompare(b.property?.propertyName)
    },
    {
      title: 'Water Meter',
      key: 'meter',
      render: (_, record) => record?.property?.meterNumber || 'N/A'
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => `${record.user?.firstName || ''} ${record.user?.lastName || ''}`.trim() || 'N/A'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => `$${parseFloat(val).toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const tokenStatus = formatTokenStatus(record.isUsed, record.expiresAt);
        return <Badge status={tokenStatus.color} text={tokenStatus.text} />;
      },
      filters: tokenStatusOptions.map((option) => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => {
        if (value === 'used') return record.isUsed;
        if (value === 'unused') return !record.isUsed;
        if (value === 'expired') return !record.isUsed && new Date(record.expiresAt) < new Date();
        return true;
      }
    },
    {
      title: 'Created',
      key: 'createdAt',
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
                setSelectedToken(record);
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
    setSearchToken('');
    setSearchProperty('');
    setSearchStatus('');
    message.info('Filters have been reset');
  };

  // Calculate token statistics
  const activeTokensCount = tokensData.filter(token => !token.isUsed && new Date(token.expiresAt) >= new Date()).length;
  const usedTokensCount = tokensData.filter(token => token.isUsed).length;
  const expiredTokensCount = tokensData.filter(token => !token.isUsed && new Date(token.expiresAt) < new Date()).length;
  const totalWaterVolume = tokensData.reduce((sum, token) => sum + parseFloat(token.units || 0), 0);

  return (
    <div className="p-4">
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Water Tokens" 
              value={totalCount} 
              prefix={<KeyOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Water Tokens"
              value={activeTokensCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Used Water Tokens"
              value={usedTokensCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Water Volume"
              value={totalWaterVolume.toFixed(2)}
              valueStyle={{ color: '#0096c7' }}
              prefix={<IoWaterOutline />}
              suffix="m³"
            />
          </Card>
        </Col>
      </Row>
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Input
            placeholder="Search by Token Value"
            prefix={<BarcodeOutlined />}
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            style={{ width: 250 }}
          />
          <Input
            placeholder="Search by Property/Water Meter"
            prefix={<HomeOutlined />}
            value={searchProperty}
            onChange={(e) => setSearchProperty(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setSearchStatus(value || '')}
            value={searchStatus || undefined}
            options={tokenStatusOptions}
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

      {/* Water Token Details Drawer */}
      <Drawer
        title={
          <Space>
            <KeyOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Water Token Details</span>
          </Space>
        }
        placement="right"
        width={620}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '0' }}
      >
        {selectedToken && (
          <div>
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0077b6 0%, #48cae4 100%)',
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
                    <KeyOutlined style={{ fontSize: '24px' }} />
                  </div>
                </Col>
                <Col flex="auto">
                  <h2 style={{ color: 'white', margin: 0, fontFamily: 'monospace' }}>{selectedToken.tokenValue}</h2>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <Tag color={formatTokenStatus(selectedToken.isUsed, selectedToken.expiresAt).color} style={{ borderRadius: '12px' }}>
                      {formatTokenStatus(selectedToken.isUsed, selectedToken.expiresAt).text}
                    </Tag>
                    <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                      <IoWaterOutline style={{ marginRight: '4px' }} />
                      <span>{parseFloat(selectedToken.units).toFixed(2)} m³</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Content Sections */}
            <div style={{ padding: '16px 24px' }}>
              {/* Token Information Section */}
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
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Token Information</span>
                </div>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Water Volume</span>}
                        value={selectedToken.units}
                        precision={2}
                        prefix={<IoWaterOutline />}
                        suffix="m³"
                        valueStyle={{
                          color: '#0096c7',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Amount</span>}
                        value={selectedToken.amount}
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

                  <Col span={24}>
                    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Token ID</span>
                            <span style={{ fontWeight: '500', wordBreak: 'break-all' }}>{selectedToken.id}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Status</span>
                            <span>
                              <Badge 
                                status={formatTokenStatus(selectedToken.isUsed, selectedToken.expiresAt).color} 
                                text={formatTokenStatus(selectedToken.isUsed, selectedToken.expiresAt).text} 
                              />
                            </span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Created At</span>
                            <span>{formatDate(selectedToken.createdAt)}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Expires At</span>
                            <span>{formatDate(selectedToken.expiresAt)}</span>
                          </div>
                        </Col>

                        {selectedToken.isUsed && (
                          <Col span={12}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Used At</span>
                              <span>{formatDate(selectedToken.usedAt)}</span>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Payment Information Section */}
              {selectedToken.payment && (
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
                    <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Payment Information</span>
                  </div>

                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                      borderRadius: '6px',
                      background: 'linear-gradient(to right, #f6ffed, #f9f9f9)'
                    }}
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col span={4}>
                        <Avatar size={64} icon={<DollarOutlined />} style={{ backgroundColor: '#52c41a' }} />
                      </Col>
                      <Col span={20}>
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                          {selectedToken.payment.referenceNumber}
                        </Title>
                        <Row gutter={16}>
                          <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <DollarOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                              <span>${parseFloat(selectedToken.payment.amount).toFixed(2)}</span>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircleOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                              <span>Status: {selectedToken.payment.status}</span>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )}

              {/* Property Information Section */}
              {selectedToken.property && (
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
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                          {selectedToken.property.propertyName}
                        </Title>
                        <Row gutter={16}>
                          <Col span={14}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <HomeOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                              <span>{selectedToken.property.address}</span>
                            </div>
                          </Col>
                          <Col span={10}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <NumberOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                              <span>Water Meter: {selectedToken.property.meterNumber}</span>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )}

              {/* User Information Section */}
              {selectedToken.user && (
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
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                          {selectedToken.user.firstName} {selectedToken.user.lastName}
                        </Title>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <BankOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                          <span>{selectedToken.user.email}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}