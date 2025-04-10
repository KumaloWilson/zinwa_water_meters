import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Divider,
  Row,
  Col,
  Tag,
  Drawer,
  Tooltip,
  Badge,
  Statistic,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  UserSwitchOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  PhoneOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  MailOutlined
} from '@ant-design/icons';
import axios from 'axios';
import propertyService from '../../services/propertiesService/propertiesService';
import CreateNewPropertyModal from './CreatePropertyModal';
import ChangeOwnerModal from './ChangeOwnerModal';
// import CreatePropertyModal from './CreatePropertyModal';
// import UpdatePropertyModal from './UpdatePropertyModal';
// import ChangeOwnerModal from './ChangeOwnerModal';

export default function PropertyManagement() {
  // Property data state
  const [propertiesData, setPropertiesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // State for filtering and modals
  const [searchName, setSearchName] = useState('');
  const [searchMeter, setSearchMeter] = useState('');
  const [searchType, setSearchType] = useState('');
  const [isAddPropertyModalVisible, setIsAddPropertyModalVisible] = useState(false);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEditPropertyModalVisible, setIsEditPropertyModalVisible] = useState(false);
  const [isChangeOwnerModalVisible, setIsChangeOwnerModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatePropertyLoading, setUpdatePropertyLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [currentPage]);

  const fetchProperties = () => {
    setLoading(true);
    propertyService
      .getProperties(currentPage)
      .then((data) => {
        setPropertiesData(data.properties || []);
        setTotalCount(data.totalCount || 0);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching properties');
        console.log(error);
        setLoading(false);
      });
  };

  const refreshState = () => {
    fetchProperties();
  };

  const propertyTypes = [
    { value: 'residential_low_density', label: 'Residential (Low Density)' },
    { value: 'residential_high_density', label: 'Residential (High Density)' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'industrial', label: 'Industrial' }
  ];

  const handleDeleteProperty = (id) => {
    propertyService
      .deleteProperty(id)
      .then((response) => {
        message.success('Property deleted successfully');
        refreshState();
      })
      .catch((error) => {
        message.error('Error deleting property');
        console.log(error);
      });
  };

  const prepareEditModal = (record) => {
    setSelectedProperty(record);
    setIsEditPropertyModalVisible(true);
  };

  const prepareChangeOwnerModal = (record) => {
    setSelectedProperty(record);
    setIsChangeOwnerModalVisible(true);
  };

  const handleEditProperty = (propertyId, values) => {
    setUpdatePropertyLoading(true);
    propertyService
      .updateProperty(propertyId, values)
      .then((response) => {
        setUpdatePropertyLoading(false);
        message.success('Property successfully updated');
        refreshState();
        setIsEditPropertyModalVisible(false);
      })
      .catch((error) => {
        setUpdatePropertyLoading(false);
        message.error('Error updating property');
        console.log(error);
      });
  };

  const handleChangeOwner = (propertyId, newOwnerId) => {
    propertyService
      .changePropertyOwner(propertyId, { newOwnerId })
      .then((response) => {
        message.success('Property owner changed successfully');
        refreshState();
        setIsChangeOwnerModalVisible(false);
      })
      .catch((error) => {
        message.error('Error changing property owner');
        console.log(error);
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

  const filteredData = propertiesData.filter(
    (item) =>
      item.propertyName.toLowerCase().includes(searchName.toLowerCase()) &&
      item.meterNumber.toLowerCase().includes(searchMeter.toLowerCase()) &&
      (searchType === '' || item.propertyType === searchType)
  );

  const columns = [
    {
      title: 'Property ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      ellipsis: true
    },

    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'propertyName',
      sorter: (a, b) => a.propertyName.localeCompare(b.propertyName)
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => `${record.owner?.firstName} ${record.owner?.lastName}`
    },
    {
      title: 'Meter Number',
      dataIndex: 'meterNumber',
      key: 'meterNumber'
    },
    {
      title: 'Type',
      dataIndex: 'propertyType',
      key: 'propertyType',
      render: (type) => {
        const propertyType = formatPropertyType(type);
        return <Tag color={propertyType.color}>{propertyType.text}</Tag>;
      },
      filters: propertyTypes.map((type) => ({ text: type.label, value: type.value })),
      onFilter: (value, record) => record.propertyType === value
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => `${record.city}`
    },

    {
      title: 'Balance',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      render: (val) => `$${val.toFixed(2)}`,
      sorter: (a, b) => a.currentBalance - b.currentBalance
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Active' : 'Inactive'} />
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <EyeOutlined
              onClick={() => {
                setSelectedProperty(record);
                setIsDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Property">
            <EditOutlined onClick={() => prepareEditModal(record)} />
          </Tooltip>
          <Tooltip title="Change Owner">
            <UserSwitchOutlined onClick={() => prepareChangeOwnerModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Property"
            description="Are you sure you want to delete this property?"
            onConfirm={() => handleDeleteProperty(record?.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Reset Filters Function
  const resetFilters = () => {
    setSearchName('');
    setSearchMeter('');
    setSearchType('');
    message.info('Filters have been reset');
  };

  return (
    <div className="p-4">
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Properties" value={totalCount} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Properties"
              value={propertiesData.filter((p) => p.isActive).length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Properties with Balance"
              value={propertiesData.filter((p) => p.currentBalance > 0).length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Residential Properties"
              value={
                propertiesData.filter((p) => p.propertyType === 'residential_low_density' || p.propertyType === 'residential_high_density')
                  .length
              }
              valueStyle={{ color: '#722ed1' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Input
            placeholder="Search by Property Name"
            prefix={<SearchOutlined />}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 250 }}
          />
          <Input
            placeholder="Search by Meter Number"
            prefix={<NumberOutlined />}
            value={searchMeter}
            onChange={(e) => setSearchMeter(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by Type"
            allowClear
            style={{ width: 220 }}
            onChange={(value) => setSearchType(value || '')}
            value={searchType || undefined}
            options={propertyTypes}
          />

          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            Reset Filters
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddPropertyModalVisible(true)}>
            Add Property
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
            pageSize: 6,
            total: totalCount,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Add Property Modal */}
      <Drawer
        title={<span style={{ color: 'red', fontWeight: 'bold' }}>Add New Property</span>}
        width={700}
        open={isAddPropertyModalVisible}
        onClose={() => setIsAddPropertyModalVisible(false)}
      >
        <CreateNewPropertyModal refreshState={refreshState} setIsAddPropertyModalVisible={setIsAddPropertyModalVisible} />
      </Drawer>

      {/* Property Details Drawer */}
      <Drawer
        title={
          <Space>
            <HomeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Property Details</span>
          </Space>
        }
        placement="right"
        width={620}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
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

            {/* Content Sections */}
            <div style={{ padding: '16px 24px' }}>
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
                      <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedProperty.id.slice(0, 8)}...</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Meter Number</div>
                      <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedProperty.meterNumber}</div>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#fa541c' }} />
                      <div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Address</div>
                        <div style={{ fontWeight: '500' }}>{selectedProperty.address}</div>
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>City</span>
                      <span>{selectedProperty.city}</span>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Province</span>
                      <span>{selectedProperty.province}</span>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Postal Code</span>
                      <span>{selectedProperty.postalCode}</span>
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
                        Latitude: {selectedProperty.latitude} | Longitude: {selectedProperty.longitude}
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
                        value={selectedProperty.currentBalance}
                        precision={2}
                        prefix={<DollarOutlined />}
                        suffix="USD"
                        valueStyle={{
                          color: selectedProperty.currentBalance > 0 ? '#cf1322' : '#3f8600',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Total Consumption</span>}
                        value={selectedProperty.totalConsumption}
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
                        {selectedProperty.lastTokenPurchase ? (
                          <Tag color="purple" style={{ marginLeft: '0' }}>
                            {new Date(selectedProperty.lastTokenPurchase).toLocaleString()}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Owner Information Section */}
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
                  <UserOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Owner Information</span>
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
                      <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#13c2c2' }} />
                    </Col>
                    <Col span={20}>
                      <h3 style={{ margin: '0 0 8px 0' }}>
                        {selectedProperty.owner.firstName} {selectedProperty.owner.lastName}
                      </h3>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MailOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>{selectedProperty.owner.email}</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                            <span>{selectedProperty.owner.phoneNumber}</span>
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

      {/* Edit Property Modal */}
      <Modal
        title="Edit Property"
        open={isEditPropertyModalVisible}
        onCancel={() => setIsEditPropertyModalVisible(false)}
        footer={null}
        width={700}
      >
        {/* <UpdatePropertyModal 
          handleUpdateProperty={handleEditProperty} 
          selectedProperty={selectedProperty} 
          loading={updatePropertyLoading} 
        /> */}
      </Modal>

      {/* Change Owner Modal */}
      <Modal
        title="Change Property Owner"
        open={isChangeOwnerModalVisible}
        onCancel={() => setIsChangeOwnerModalVisible(false)}
        footer={null}
      >
        <ChangeOwnerModal
          propertyId={selectedProperty?.id}
          currentOwnerId={selectedProperty?.owner?.id}
          handleChangeOwner={handleChangeOwner}
          onSuccess={() => setIsChangeOwnerModalVisible(false)}
        />
      </Modal>
    </div>
  );
}
