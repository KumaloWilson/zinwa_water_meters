import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Space,
  Row,
  Col,
  Tag,
  Badge,
  Avatar,
  Card,
  Statistic,
  Table,
  Tabs,
  Empty,
  Spin,
  Descriptions,
  Timeline,
  List
} from 'antd';
import {
  HomeOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { IoWaterOutline } from 'react-icons/io5';
import propertyService from '../../services/propertiesService/propertiesService';
import paymentService from '../../services/paymentService/paymentService';
import tokenService from '../../services/tokenService/tokenService';
import meterReadingService from '../../services/meterReadingsService/meterReadingsService';
import userService from '../../services/userService/userService';

export default function PropertyDetailsDrawer({ isVisible, onClose, selectedProperty }) {
  // States for different data sections
  const [propertyTransactions, setPropertyTransactions] = useState([]);
  const [propertyTokens, setPropertyTokens] = useState([]);
  const [propertyMeterReadings, setPropertyMeterReadings] = useState([]);
  const [ownerDetails, setOwnerDetails] = useState(null);
  
  // Loading states
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [meterReadingsLoading, setMeterReadingsLoading] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);

  useEffect(() => {
    if (selectedProperty && isVisible) {
      fetchPropertyTransactions(selectedProperty.id);
      fetchPropertyTokens(selectedProperty.id);
      fetchPropertyMeterReadings(selectedProperty.id);
      fetchOwnerDetails(selectedProperty.owner.id);
    }
  }, [selectedProperty, isVisible]);

  const fetchPropertyTransactions = (propertyId) => {
    setTransactionsLoading(true);
    paymentService.getPaymentsByPropertyId(propertyId)
      .then(data => {
        // console.log("Property transactions:", data);
        setPropertyTransactions(data.payments || []);
        setTransactionsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching property transactions:", error);
        setTransactionsLoading(false);
      });
  };

  const fetchPropertyTokens = (propertyId) => {
    setTokensLoading(true);
    tokenService.getTokensByPropertyId(propertyId)
      .then(data => {
        // console.log("Property tokens:", data);
        setPropertyTokens(data.tokens || []);
        setTokensLoading(false);
      })
      .catch(error => {
        console.error("Error fetching property tokens:", error);
        setTokensLoading(false);
      });
  };

  const fetchPropertyMeterReadings = (propertyId) => {
    setMeterReadingsLoading(true);
    meterReadingService.getLatestMeterReadingByPropertyId(propertyId)
      .then(data => {
        // console.log("Property meter readings:", data);
        setPropertyMeterReadings(data?.meterReadings || []);
        setMeterReadingsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching property meter readings:", error);
        setMeterReadingsLoading(false);
      });
  };

  const fetchOwnerDetails = (ownerId) => {
    setOwnerLoading(true);
    userService.getUserById(ownerId)
      .then(data => {
        // console.log("Owner details:", data);
        setOwnerDetails(data.user || null);
        setOwnerLoading(false);
      })
      .catch(error => {
        console.error("Error fetching owner details:", error);
        setOwnerLoading(false);
      });
  };

  const formatPropertyType = (type) => {
    const typeMap = {
      residential_low_density: { text: 'Residential (Low Density)', color: 'green' },
      residential_high_density: { text: 'Residential (High Density)', color: 'cyan' },
      commercial: { text: 'Commercial', color: 'blue' },
      agricultural: { text: 'Agricultural', color: 'gold' },
      industrial: { text: 'Industrial', color: 'purple' }
    };

    return typeMap[type] || { text: type, color: 'default' };
  };

  // Tab items for the property details
  const items = [
    {
      key: '1',
      label: 'Property Info',
      children: (
        <div>
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
              <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Property Information</span>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Property ID</div>
                  <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedProperty?.id?.slice(0, 8)}...</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Meter Number</div>
                  <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedProperty?.meterNumber}</div>
                </div>
              </Col>

              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <EnvironmentOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#fa541c' }} />
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Address</div>
                    <div style={{ fontWeight: '500' }}>{selectedProperty?.address}</div>
                  </div>
                </div>
              </Col>

              <Col span={8}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>City</span>
                  <span>{selectedProperty?.city}</span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Province</span>
                  <span>{selectedProperty?.province}</span>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Postal Code</span>
                  <span>{selectedProperty?.postalCode}</span>
                </div>
              </Col>

              <Col span={24}>
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '6px',
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f'
                  }}
                >
                  <div style={{ color: '#52c41a', marginBottom: '4px', fontWeight: '500' }}>Location Coordinates</div>
                  <div>
                    Latitude: {selectedProperty?.latitude} | Longitude: {selectedProperty?.longitude}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Consumption & Billing Section */}
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
              <ThunderboltOutlined style={{ marginRight: '8px', color: '#faad14' }} />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Consumption & Billing</span>
            </div>

            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                  <Statistic
                    title={<span style={{ fontSize: '14px' }}>Current Balance</span>}
                    value={selectedProperty?.currentBalance}
                    precision={2}
                    prefix={<DollarOutlined />}
                    suffix="USD"
                    valueStyle={{
                      color: selectedProperty?.currentBalance > 0 ? '#cf1322' : '#3f8600',
                      fontSize: '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                  <Statistic
                    title={<span style={{ fontSize: '14px' }}>Total Consumption</span>}
                    value={selectedProperty?.totalConsumption}
                    precision={2}
                    prefix={<ThunderboltOutlined />}
                    suffix="kWh"
                    valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                  />
                </Card>
              </Col>

              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  <div>
                    <span style={{ color: '#8c8c8c', fontSize: '12px', marginRight: '8px' }}>Last Token Purchase:</span>
                    {selectedProperty?.lastTokenPurchase ? (
                      <Tag color="purple" style={{ marginLeft: '0' }}>
                        {new Date(selectedProperty?.lastTokenPurchase).toLocaleString()}
                      </Tag>
                    ) : (
                      <Tag color="default">N/A</Tag>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Owner Details',
      children: (
        <div>
          {ownerLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : ownerDetails ? (
            <div>
              {/* Owner's Basic Information */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  paddingBottom: '8px'
                }}
              >
                <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Owner Information</span>
              </div>

              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  background: 'linear-gradient(to right, #e6f7ff, #f9f9f9)'
                }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col span={4}>
                    <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  </Col>
                  <Col span={20}>
                    <h3 style={{ margin: '0 0 8px 0' }}>
                      {ownerDetails.firstName} {ownerDetails.lastName}
                    </h3>
                    <Tag color="blue">{ownerDetails.role || 'Property Owner'}</Tag>
                    <Badge
                      status={ownerDetails.isVerified ? 'success' : 'error'}
                      text={ownerDetails.isVerified ? 'Verified' : 'Unverified'}
                      style={{ marginLeft: '8px' }}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Detailed Owner Information */}
              <Descriptions
                title="Contact Information"
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                style={{ marginBottom: '24px' }}
              >
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {ownerDetails.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    {ownerDetails.phoneNumber || 'Not provided'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="User ID">{ownerDetails.id}</Descriptions.Item>
                <Descriptions.Item label="Registration Date">
                  {ownerDetails.createdAt ? new Date(ownerDetails.createdAt).toLocaleDateString() : 'Not available'}
                </Descriptions.Item>
              </Descriptions>

              {/* Additional Properties Owned */}
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
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Other Properties Owned</span>
              </div>

              {ownerDetails.properties && ownerDetails.properties.length > 0 ? (
                <List
                  dataSource={ownerDetails.properties.filter(p => p.id !== selectedProperty?.id)}
                  renderItem={property => (
                    <List.Item>
                      <Card style={{ width: '100%', borderRadius: '8px' }} hoverable>
                        <Row align="middle" gutter={16}>
                          <Col span={4}>
                            <div
                              style={{
                                backgroundColor: '#e6f7ff',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <HomeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                            </div>
                          </Col>
                          <Col span={12}>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{property.propertyName}</div>
                              <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{property.address}</div>
                            </div>
                          </Col>
                          <Col span={4}>
                            <Tag color={property.isActive ? 'green' : 'red'}>
                              {property.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                          </Col>
                          <Col span={4}>
                            <Tag color="blue">{formatPropertyType(property.propertyType).text}</Tag>
                          </Col>
                        </Row>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#8c8c8c' }}>No other properties owned by this user</span>
                  }
                />
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#8c8c8c' }}>No owner details available</span>
              }
            />
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: 'Transactions',
      children: (
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
            <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Payment & Transaction History</span>
          </div>

          {transactionsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : propertyTransactions.length > 0 ? (
            <Table
              dataSource={propertyTransactions}
              pagination={{ pageSize: 5 }}
              rowKey="id"
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (text) => new Date(text).toLocaleDateString()
                },
                {
                  title: 'Transaction ID',
                  dataIndex: 'transactionId',
                  key: 'transactionId',
                  render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 8)}...</span>
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount) => (
                    <span style={{ color: '#52c41a', fontWeight: '500' }}>
                      ${parseFloat(amount).toFixed(2)}
                    </span>
                  )
                },
                {
                  title: 'Payment Method',
                  dataIndex: 'paymentMethod',
                  key: 'paymentMethod',
                  render: (method) => <Tag color="blue">{method}</Tag>
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge
                      status={status === 'Completed' ? 'success' : status === 'Pending' ? 'processing' : 'error'}
                      text={status}
                    />
                  )
                }
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#8c8c8c' }}>No transaction history available</span>
              }
            />
          )}
        </div>
      ),
    },
    {
      key: '4',
      label: 'Token History',
      children: (
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
            <IoWaterOutline style={{ marginRight: '8px', color: '#faad14', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Token Purchase History</span>
          </div>

          {tokensLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : propertyTokens.length > 0 ? (
            <Table
              dataSource={propertyTokens}
              pagination={{ pageSize: 5 }}
              rowKey="id"
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (text) => new Date(text).toLocaleDateString()
                },
                {
                  title: 'Token',
                  dataIndex: 'tokenValue',
                  key: 'tokenValue',
                  render: (token) => (
                    <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                      {token.slice(0, 4)}...{token.slice(-4)}
                    </span>
                  )
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount) => `$${parseFloat(amount).toFixed(2)}`
                },
                {
                  title: 'Units',
                  dataIndex: 'units',
                  key: 'units',
                  render: (m) => (
                    <span style={{ color: '#1890ff', fontWeight: '500' }}>
                      {parseFloat(m).toFixed(2)} m³
                    </span>
                  )
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge
                      status={status === 'Active' ? 'success' : status === 'Used' ? 'default' : 'warning'}
                      text={status}
                    />
                  )
                }
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#8c8c8c' }}>No token purchase history available</span>
              }
            />
          )}
        </div>
      ),
    },
    {
      key: '5',
      label: 'Meter Readings',
      children: (
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
            <ReadOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Meter Reading History</span>
          </div>

          {meterReadingsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : propertyMeterReadings.length > 0 ? (
            <div>
              <Card style={{ marginBottom: '20px' }}>
                <Statistic
                  title="Latest Reading"
                  value={propertyMeterReadings[0]?.reading}
                  precision={2}
                  suffix="m³"
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c' }}>
                  Recorded on {new Date(propertyMeterReadings[0]?.readingDate).toLocaleString()}
                </div>
              </Card>

              <Table
                dataSource={propertyMeterReadings}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                columns={[
                  {
                    title: 'Reading Date',
                    dataIndex: 'readingDate',
                    key: 'readingDate',
                    render: (text) => new Date(text).toLocaleDateString()
                  },
                  {
                    title: 'Reading',
                    dataIndex: 'reading',
                    key: 'reading',
                    render: (reading) => (
                      <span style={{ color: '#1890ff', fontWeight: '500' }}>
                        {parseFloat(reading).toFixed(2)} m³
                      </span>
                    )
                  },
                  {
                    title: 'Consumption',
                    dataIndex: 'consumption',
                    key: 'consumption',
                    render: (consumption) => (
                      <span style={{ fontWeight: '500' }}>
                        {parseFloat(consumption).toFixed(2)} m³
                      </span>
                    )
                  },
                  {
                    title: 'Source',
                    dataIndex: 'source',
                    key: 'source',
                    render: (source) => <Tag color="blue">{source}</Tag>
                  }
                ]}
              />

              <div style={{ marginTop: '20px' }}>
                <Timeline
                  mode="left"
                  items={propertyMeterReadings.slice(0, 5).map((reading, index) => ({
                    label: new Date(reading.readingDate).toLocaleDateString(),
                    children: (
                      <div>
                        <div style={{ fontWeight: '500' }}>{parseFloat(reading.reading).toFixed(2)} m³</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {reading.source} reading
                        </div>
                      </div>
                    ),
                    color: index === 0 ? 'blue' : 'gray',
                  }))}
                />
              </div>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#8c8c8c' }}>No meter readings available</span>
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <HomeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Property Details</span>
        </Space>
      }
      placement="right"
      width={700}
      onClose={onClose}
      open={isVisible}
      headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
      bodyStyle={{ padding: '0' }}
    >
      {selectedProperty && (
        <div>
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              padding: '24px',
              color: 'white',
              borderRadius: '0 0 8px 8px',
              marginBottom: '16px'
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
                  <HomeOutlined style={{ fontSize: '24px' }} />
                </div>
              </Col>
              <Col flex="auto">
                <h2 style={{ color: 'white', margin: 0 }}>{selectedProperty.propertyName}</h2>
                <div style={{ marginTop: '8px' }}>
                  <Tag color={formatPropertyType(selectedProperty.propertyType).color} style={{ borderRadius: '12px' }}>
                    {formatPropertyType(selectedProperty.propertyType).text}
                  </Tag>
                  <Badge
                    status={selectedProperty.isActive ? 'success' : 'error'}
                    text={selectedProperty.isActive ? 'Active' : 'Inactive'}
                    style={{ marginLeft: '8px', color: 'white' }}
                  />
                </div>
              </Col>
            </Row>
          </div>

          {/* Tabbed Content */}
          <div style={{ padding: '0 24px 24px 24px' }}>
            <Tabs defaultActiveKey="1" items={items} />
          </div>
        </div>
      )}
    </Drawer>
  );
};

