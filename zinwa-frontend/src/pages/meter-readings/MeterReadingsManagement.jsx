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
  Typography,
  Form,
  DatePicker,
  Switch,
  InputNumber,
  Modal,
  Popconfirm,
  message
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  NumberOutlined,
  PlusOutlined,
  LineChartOutlined,
  WarningOutlined
} from '@ant-design/icons';
// import CreateReadingModal from './CreateReadingModal';
// import UpdateReadingModal from './UpdateReadingModal';
import meterReadingService from '../../services/meterReadingsService/meterReadingsService';
import propertyService from '../../services/propertiesService/propertiesService';
import CreateReadingModal from './CreateReadingModal';
import UpdateReadingModal from './UpdateReadingModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function MeterReadingsManagement() {
  // Meter reading data states
  const [readingsData, setReadingsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filtering and drawers
  const [searchProperty, setSearchProperty] = useState('');
  const [searchEstimated, setSearchEstimated] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [propertyOptions, setPropertyOptions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReadings();
    fetchPropertyOptions();
  }, [currentPage]);
console.log(propertyOptions)


  const fetchReadings = () => {
    setLoading(true);
    meterReadingService
      .getMeterReadings(currentPage)
      .then((data) => {
        setReadingsData(data.meterReadings || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching meter readings');
        console.error(error);
        setLoading(false);
      });
  };

  const fetchPropertyOptions = () => {
    setLoading(true);
    propertyService
      .getProperties() 
      .then((data) => {

        const propertyOptions = data?.properties?.map(property => ({
          value: property.id,
          label: property.propertyName
        }));
        setPropertyOptions(propertyOptions);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching property options');
        console.log(error);
        setLoading(false);
      });
  };

  const refreshState = () => {
    fetchReadings();
    message.success('Meter readings refreshed successfully');
  };

  const estimatedOptions = [
    { value: 'true', label: 'Estimated' },
    { value: 'false', label: 'Actual' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteReading = (id) => {
    meterReadingService
      .deleteMeterReading(id)
      .then((response) => {
        message.success('Meter reading deleted successfully');
        refreshState();
      })
      .catch((error) => {
        message.error('Error deleting meter reading');
        console.error(error);
      });
  };

  const prepareEditModal = (record) => {
    setSelectedReading(record);
    setIsEditModalVisible(true);
  };

  const filteredData = readingsData.filter(
    (item) => {
      const matchesProperty = !searchProperty || 
                           (item.property && item.property.id === searchProperty);
      
      const matchesEstimated = searchEstimated === '' || 
                           String(item.isEstimated) === searchEstimated;
      
      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const readingDate = new Date(item.readingDate);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        matchesDateRange = readingDate >= startDate && readingDate <= endDate;
      }
      
      return matchesProperty && matchesEstimated && matchesDateRange;
    }
  );

  const columns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <div>
          <div>{record.property ? record.property.propertyName : 'Unknown Property'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.property ? record.property.address : ''}
          </Text>
        </div>
      ),
      sorter: (a, b) => {
        if (!a.property || !b.property) return 0;
        return a.property.propertyName.localeCompare(b.property.propertyName);
      }
    },
    {
      title: 'Meter Number',
      key: 'meterNumber',
      render: (_, record) => (
        record.property ? record.property.meterNumber : 'N/A'
      )
    },
    {
      title: 'Reading',
      dataIndex: 'reading',
      key: 'reading',
      render: (value) => parseFloat(value).toFixed(2),
      sorter: (a, b) => a.reading - b.reading
    },
    {
      title: 'Consumption',
      dataIndex: 'consumption',
      key: 'consumption',
      render: (value) => parseFloat(value).toFixed(2),
      sorter: (a, b) => a.consumption - b.consumption
    },
    {
      title: 'Reading Type',
      key: 'isEstimated',
      render: (_, record) => (
        <Badge 
          status={record.isEstimated ? 'warning' : 'success'} 
          text={record.isEstimated ? 'Estimated' : 'Actual'} 
        />
      ),
      filters: [
        { text: 'Actual', value: false },
        { text: 'Estimated', value: true }
      ],
      onFilter: (value, record) => record.isEstimated === value
    },
    {
      title: 'Reading Date',
      key: 'readingDate',
      render: (_, record) => formatDate(record.readingDate),
      sorter: (a, b) => new Date(a.readingDate) - new Date(b.readingDate)
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text) => text || 'No notes'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <EyeOutlined
              onClick={() => {
                setSelectedReading(record);
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
            title="Delete Reading"
            description="Are you sure you want to delete this meter reading?"
            onConfirm={() => handleDeleteReading(record?.id)}
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
    setSearchProperty('');
    setSearchEstimated('');
    setDateRange(null);
    message.info('Filters have been reset');
  };

  // Calculate meter reading statistics
  const estimatedReadingsCount = readingsData.filter(reading => 
    reading.isEstimated
  ).length;
  
  const actualReadingsCount = readingsData.filter(reading => 
    !reading.isEstimated
  ).length;
  
  const totalConsumption = readingsData.reduce(
    (sum, reading) => sum + parseFloat(reading.consumption || 0), 
    0
  ).toFixed(2);
  
  const averageConsumption = readingsData.length > 0 ? 
    (readingsData.reduce((sum, reading) => sum + parseFloat(reading.consumption || 0), 0) 
    / readingsData.length).toFixed(2) : 
    0;

  return (
    <div className="p-4">
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Readings" 
              value={totalCount} 
              prefix={<DashboardOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Actual Readings"
              value={actualReadingsCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<NumberOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Estimated Readings"
              value={estimatedReadingsCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Consumption"
              value={totalConsumption}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Select
            placeholder="Filter by Property"
            allowClear
            style={{ width: 250 }}
            onChange={(value) => setSearchProperty(value || '')}
            value={searchProperty || undefined}
          >
            {propertyOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="Filter by Reading Type"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setSearchEstimated(value || '')}
            value={searchEstimated || undefined}
          >
            {estimatedOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          
          <RangePicker 
            style={{ width: 300 }}
            onChange={(dates) => setDateRange(dates)}
            value={dateRange}
            placeholder={['Start Date', 'End Date']}
          />

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
              setIsCreateModalVisible(true);
            }}
            style={{ marginLeft: 'auto', background: '#52c41a', borderColor: '#52c41a' }}
          >
            Add New Reading
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

      {/* Reading Details Drawer */}
      <Drawer
        title={
          <Space>
            <DashboardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Meter Reading Details</span>
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
      >
        {selectedReading && (
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
                    <DashboardOutlined style={{ fontSize: '24px' }} />
                  </div>
                </Col>
                <Col flex="auto">
                  <h2 style={{ color: 'white', margin: 0 }}>
                    {selectedReading.property ? selectedReading.property.propertyName : 'Unknown Property'}
                  </h2>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <Tag color={selectedReading.isEstimated ? 'warning' : 'success'} style={{ borderRadius: '12px' }}>
                      {selectedReading.isEstimated ? 'Estimated' : 'Actual'}
                    </Tag>
                    <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                      <HomeOutlined style={{ marginRight: '4px' }} />
                      <span>{selectedReading.property ? selectedReading.property.address : 'N/A'}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Content Sections */}
            <div style={{ padding: '16px 24px' }}>
              {/* Reading Information Section */}
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
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Reading Information</span>
                </div>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <Statistic
                        title={<span style={{ fontSize: '14px' }}>Meter Reading</span>}
                        value={selectedReading.reading}
                        precision={2}
                        prefix={<NumberOutlined />}
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
                        title={<span style={{ fontSize: '14px' }}>Consumption</span>}
                        value={selectedReading.consumption}
                        precision={2}
                        prefix={<LineChartOutlined />}
                        valueStyle={{
                          color: '#52c41a',
                          fontSize: '20px'
                        }}
                      />
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>Reading Type</div>
                        <div style={{ marginTop: '5px' }}>
                          <Badge 
                            status={selectedReading.isEstimated ? 'warning' : 'success'} 
                            text={
                              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                                {selectedReading.isEstimated ? 'Estimated' : 'Actual'}
                              </span>
                            } 
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>Reading Date</div>
                        <div style={{ marginTop: '5px', fontSize: '16px', fontWeight: '500' }}>
                          {formatDate(selectedReading.readingDate)}
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col span={24}>
                    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Reading ID</span>
                            <span style={{ fontWeight: '500', wordBreak: 'break-all' }}>{selectedReading.id}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Meter Number</span>
                            <span style={{ fontWeight: '500' }}>
                              {selectedReading.property ? selectedReading.property.meterNumber : 'N/A'}
                            </span>
                          </div>
                        </Col>
                        
                        <Col span={24}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Notes</span>
                            <span>{selectedReading.notes || 'No notes provided'}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Created At</span>
                            <span>{formatDate(selectedReading.createdAt)}</span>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>Last Updated</span>
                            <span>{formatDate(selectedReading.updatedAt)}</span>
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

      {/* Create & Edit Modals */}
      <Modal title="Add New Meter Reading" open={isCreateModalVisible} onCancel={() => setIsCreateModalVisible(false)} footer={null}>
        <CreateReadingModal refreshState={refreshState} setIsCreateModalVisible={setIsCreateModalVisible} />
      </Modal>

      <Modal title="Edit Meter Reading" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
        <UpdateReadingModal refreshState={refreshState} setIsEditModalVisible={setIsEditModalVisible} selectedReading={selectedReading} readingId={selectedReading?.id} />
      </Modal>
    </div>
  );
}