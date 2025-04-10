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
  Typography,
  Form,
  DatePicker,
  Switch,
  InputNumber,
  Modal,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  BankOutlined,
  PlusOutlined,
  PercentageOutlined,
  NumberOutlined
} from '@ant-design/icons';
import rateService from '../../services/rateService/rateService';
import CreateRateModal from './CreateRateModal';
import UpdateRateModal from './UpdateRateModal';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RateManagement() {
  // Rate data state
  const [ratesData, setRatesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filtering and drawers
  const [searchPropertyType, setSearchPropertyType] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isCreateDrawerVisible, setIsCreateDrawerVisible] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRates();
  }, [currentPage]);

   
  
    const fetchRates = () => {
      setLoading(true);
      rateService
        .getRates(currentPage)
        .then((data) => {
          setRatesData(data.rates || []);
          setTotalCount(data.totalCount || 0);
          setTotalPages(data.totalPages);
          setLoading(false);
        })
        .catch((error) => {
          message.error('Error fetching properties');
          console.log(error);
          setLoading(false);
        });
    };
  
   

 

  const refreshState = () => {
    fetchRates();
    message.success('Rates refreshed successfully');
  };

  const propertyTypeOptions = [
    { value: 'residential_high_density', label: 'Residential (High Density)' },
    { value: 'residential_low_density', label: 'Residential (Low Density)' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expiring', label: 'Expiring Soon' }
  ];

  const formatRateStatus = (isActive, endDate) => {
    if (!isActive) {
      return { text: 'Inactive', color: 'error' };
    }
    
    if (!endDate) {
      return { text: 'Active', color: 'success' };
    }
    
    const now = new Date();
    const expiry = new Date(endDate);
    const monthDiff = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
    
    if (expiry < now) {
      return { text: 'Expired', color: 'error' };
    } else if (monthDiff <= 3) {
      return { text: 'Expiring Soon', color: 'warning' };
    } else {
      return { text: 'Active', color: 'success' };
    }
  };

  const formatPropertyType = (type) => {
    if (!type) return 'N/A';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredData = ratesData.filter(
    (item) =>
      (searchPropertyType === '' || item.propertyType === searchPropertyType) &&
      (searchStatus === '' || 
       (searchStatus === 'active' && item.isActive && (!item.endDate || new Date(item.endDate) > new Date())) ||
       (searchStatus === 'inactive' && !item.isActive) ||
       (searchStatus === 'expiring' && item.isActive && item.endDate && 
        ((new Date(item.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30) <= 3)))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'No End Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteRate = (id) => {
    rateService
      .deleteRate(id)
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
    setSelectedRate(record);
    setIsEditDrawerVisible(true);
  };

 

  const columns = [
    {
      title: 'Property Type',
      key: 'propertyType',
      render: (_, record) => (
        <div>
          <div>{formatPropertyType(record.propertyType)}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
        </div>
      ),
      sorter: (a, b) => a.propertyType.localeCompare(b.propertyType)
    },
    {
      title: 'Rate per Unit',
      dataIndex: 'ratePerUnit',
      key: 'ratePerUnit',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
      sorter: (a, b) => a.ratePerUnit - b.ratePerUnit
    },
    {
      title: 'Fixed Charge',
      dataIndex: 'fixedCharge',
      key: 'fixedCharge',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
      sorter: (a, b) => a.fixedCharge - b.fixedCharge
    },
    {
      title: 'Minimum Charge',
      dataIndex: 'minimumCharge',
      key: 'minimumCharge',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
      sorter: (a, b) => a.minimumCharge - b.minimumCharge
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = formatRateStatus(record.isActive, record.endDate);
        return <Badge status={status.color} text={status.text} />;
      },
      filters: statusOptions.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => {
        if (value === 'active') return record.isActive && (!record.endDate || new Date(record.endDate) > new Date());
        if (value === 'inactive') return !record.isActive;
        if (value === 'expiring') return record.isActive && record.endDate && 
          ((new Date(record.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30) <= 3);
        return true;
      }
    },
    {
      title: 'Effective Date',
      key: 'effectiveDate',
      render: (_, record) => formatDate(record.effectiveDate),
      sorter: (a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate)
    },
    {
      title: 'End Date',
      key: 'endDate',
      render: (_, record) => formatDate(record.endDate),
      sorter: (a, b) => {
        // Handle null endDates
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <EyeOutlined
              onClick={() => {
                setSelectedRate(record);
                setIsDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() => prepareEditModal(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="Delete Property"
            description="Are you sure you want to delete this property?"
            onConfirm={() => handleDeleteRate(record?.id)}
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
    setSearchPropertyType('');
    setSearchStatus('');
    message.info('Filters have been reset');
  };

  // Calculate rate statistics
  const activeRatesCount = ratesData.filter(rate => 
    rate.isActive && (!rate.endDate || new Date(rate.endDate) > new Date())
  ).length;
  
  const expiringRatesCount = ratesData.filter(rate => 
    rate.isActive && 
    rate.endDate && 
    ((new Date(rate.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30) <= 3)
  ).length;
  
  const inactiveRatesCount = ratesData.filter(rate => !rate.isActive).length;
  
  const averageRatePerUnit = ratesData.length > 0 ? 
    (ratesData.reduce((sum, rate) => sum + parseFloat(rate.ratePerUnit || 0), 0) / ratesData.length).toFixed(2) : 
    0;

    
  return (
    <div className="p-4">
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Rates" 
              value={totalCount} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Rates"
              value={activeRatesCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringRatesCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Rate per Unit"
              value={averageRatePerUnit}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PercentageOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Select
            placeholder="Filter by Property Type"
            allowClear
            style={{ width: 250 }}
            onChange={(value) => setSearchPropertyType(value || '')}
            value={searchPropertyType || undefined}
          >
            {propertyTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setSearchStatus(value || '')}
            value={searchStatus || undefined}
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>

          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            Reset Filters
          </Button>

          <Button type="primary" icon={<ReloadOutlined />} onClick={refreshState}>
            Refresh
          </Button>

          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              form.resetFields();
              setIsCreateDrawerVisible(true);
            }}
            style={{ marginLeft: 'auto', background: '#52c41a', borderColor: '#52c41a' }}
          >
            Create New Rate
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

      {/* Rate Details Drawer */}
      <Drawer
        title={
          <Space>
            <DollarOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Rate Details</span>
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
      
      >
        {selectedRate && (
          <div>
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
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
                  <h2 style={{ color: 'white', margin: 0 }}>{formatPropertyType(selectedRate.propertyType)}</h2>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <Tag color={formatRateStatus(selectedRate.isActive, selectedRate.endDate).color} style={{ borderRadius: '12px' }}>
                      {formatRateStatus(selectedRate.isActive, selectedRate.endDate).text}
                    </Tag>
                    <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                      <DollarOutlined style={{ marginRight: '4px' }} />
                      <span>${parseFloat(selectedRate.ratePerUnit).toFixed(2)} per unit</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Content Sections */}
            <div style={{ padding: '16px 24px' }}>
              {/* Rate Information Section */}
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
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Rate Information</span>
                </div>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Rate Per Unit</span>}
                        value={selectedRate.ratePerUnit}
                        precision={2}
                        prefix={<DollarOutlined />}
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
                        title={<span style={{ fontSize: '14px' }}>Fixed Charge</span>}
                        value={selectedRate.fixedCharge}
                        precision={2}
                        prefix={<DollarOutlined />}
                        valueStyle={{
                          color: '#52c41a',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Minimum Charge</span>}
                        value={selectedRate.minimumCharge}
                        precision={2}
                        prefix={<DollarOutlined />}
                        valueStyle={{
                          color: '#fa8c16',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>Status</div>
                        <div style={{ marginTop: '5px' }}>
                          <Badge 
                            status={formatRateStatus(selectedRate.isActive, selectedRate.endDate).color} 
                            text={
                              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                                {formatRateStatus(selectedRate.isActive, selectedRate.endDate).text}
                              </span>
                            } 
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col span={24}>
                    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Rate ID</span>
                            <span style={{ fontWeight: '500', wordBreak: 'break-all' }}>{selectedRate.id}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Property Type</span>
                            <span style={{ fontWeight: '500' }}>{formatPropertyType(selectedRate.propertyType)}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Effective Date</span>
                            <span>{formatDate(selectedRate.effectiveDate)}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>End Date</span>
                            <span>{formatDate(selectedRate.endDate)}</span>
                          </div>
                        </Col>

                        <Col span={24}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Description</span>
                            <span>{selectedRate.description || 'No description provided'}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Created At</span>
                            <span>{formatDate(selectedRate.createdAt)}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Last Updated</span>
                            <span>{formatDate(selectedRate.updatedAt)}</span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </div>

             
            </div>
          </div>
        )}
      </Drawer>

      <Modal title="Add New Rate" open={isCreateDrawerVisible} onCancel={() => setIsCreateDrawerVisible(false)} footer={null}>
        <CreateRateModal  refreshState={refreshState} setIsCreateDrawerVisible={setIsCreateDrawerVisible} />
      </Modal>

      <Modal  open={isEditDrawerVisible} onCancel={() => setIsEditDrawerVisible(false)} footer={null}>
        <UpdateRateModal  refreshState={refreshState} setIsEditDrawerVisible={setIsEditDrawerVisible}   selectedRate={selectedRate} rateID ={selectedRate?.id} />
      </Modal>
    
      </div>
  ) }