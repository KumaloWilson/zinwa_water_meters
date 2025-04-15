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
import PropertyDetailsDrawer from './PropertyDetailsDrawer';
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
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
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

  const zimbabweLocations = {
    'Harare': ['Harare', 'Chitungwiza', 'Epworth'],
    'Bulawayo': ['Bulawayo'],
    'Manicaland': ['Mutare', 'Chipinge', 'Rusape', 'Birchenough Bridge'],
    'Mashonaland Central': ['Bindura', 'Shamva', 'Mt Darwin', 'Concession'],
    'Mashonaland East': ['Marondera', 'Ruwa', 'Mutoko', 'Chivhu'],
    'Mashonaland West': ['Chinhoyi', 'Karoi', 'Chegutu', 'Kadoma', 'Norton'],
    'Masvingo': ['Masvingo', 'Chiredzi', 'Gutu', 'Zaka'],
    'Matabeleland North': ['Hwange', 'Victoria Falls', 'Lupane', 'Binga'],
    'Matabeleland South': ['Gwanda', 'Beitbridge', 'Plumtree', 'Esigodini'],
    'Midlands': ['Gweru', 'Kwekwe', 'Zvishavane', 'Shurugwi', 'Gokwe']
  };
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
    console.log(propertyId)
    const reqBody = {
      userId: newOwnerId
    }
    console.log(reqBody)
    propertyService
      .changePropertyOwner(propertyId, reqBody)
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

  useEffect(() => {
    if (selectedProvince) {
      setAvailableCities(zimbabweLocations[selectedProvince] || []);
      setSelectedCity(''); // Reset city selection when province changes
    } else {
      setAvailableCities([]);
      setSelectedCity('');
    }
  }, [selectedProvince]);

  // Handle province selection
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
  };

  // Handle city selection
  const handleCityChange = (value) => {
    setSelectedCity(value);
  };

  // Advanced filtering with province and city
  const filteredData = propertiesData.filter(
    (item) =>
      item.propertyName.toLowerCase().includes(searchName.toLowerCase()) &&
      item.meterNumber.toLowerCase().includes(searchMeter.toLowerCase()) &&
      (searchType === '' || item.propertyType === searchType) &&
      (selectedProvince === '' || item.province === selectedProvince) &&
      (selectedCity === '' || item.city === selectedCity)
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
          {/* <Tooltip title="Edit Property">
            <EditOutlined onClick={() => prepareEditModal(record)} />
          </Tooltip> */}
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
    setSelectedProvince('');
    setSelectedCity('');
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
  style={{ width: 200 }}
  placeholder="Select Province"
  allowClear
  onChange={handleProvinceChange}
  value={selectedProvince || undefined}  // Change this line
>
  {Object.keys(zimbabweLocations).map(province => (
    <Select.Option key={province} value={province}>
      {province}
    </Select.Option>
  ))}
</Select>

<Select
  style={{ width: 200 }}
  placeholder="Select City"
  allowClear
  onChange={handleCityChange}
  value={selectedCity || undefined}  // Change this line
  disabled={!selectedProvince}
>
  {availableCities.map(city => (
    <Select.Option key={city} value={city}>
      {city}
    </Select.Option>
  ))}
</Select>
          
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
      <PropertyDetailsDrawer
  isVisible={isDetailsDrawerVisible}
  onClose={() => setIsDetailsDrawerVisible(false)}
  selectedProperty={selectedProperty}
/>

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
