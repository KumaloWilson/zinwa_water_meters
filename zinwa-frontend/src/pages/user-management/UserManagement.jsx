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
  DatePicker,
  Avatar,
  Badge,
  Spin,
  List,
  Empty
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { IoWaterOutline } from "react-icons/io5";

// import { SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import CreateNewUserModal from './CreateNewUserModal';
import userService from '../../services/userService/userService';
import UpdateUserModal from './UpdateUserModal';
import AssignRoleModal from './AssignUserRole';
import propertyService from '../../services/propertiesService/propertiesService';
import paymentService from '../../services/paymentService/paymentService';
import tokenService from '../../services/tokenService/tokenService';

export default function UserManagement() {
  //   const {  user } = useUser();
  //   console.log(user?.username)
  //   console.log(user)

  // Enhanced staff data with more fields
  const [staffData, setStaffData] = useState([]);
console.log(staffData)
  // State for filtering and modals
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchRole, setSearchRole] = useState(''); // New state for role filtering
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditEmployeeModalVisible, setIsEditEmployeeModalVisible] = useState(false);
  const [editEmployeeForm] = Form.useForm();
  const [addEmployeeForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);



const [selectedUser, setSelectedUser] = useState(null);
const [userPropertiesLoading, setUserPropertiesLoading] = useState(false);
const [userProperties, setUserProperties] = useState([]);
const [userPaymentsLoading, setUserPaymentsLoading] = useState(false);
const [userPayments, setUserPayments] = useState([]);
const [userTokensLoading, setUserTokensLoading] = useState(false);
const [userTokens, setUserTokens] = useState([]);
//  console.log(userTokens)
// Function to fetch all user data when clicking view details
const fetchUserDetails = (userId) => {
  // First set the selected user from staffData
  const user = staffData?.users?.find(u => u.id === userId);
  setSelectedUser(user);
  setIsDetailsDrawerVisible(true);
  
  // Then fetch properties, payments and tokens separately
  
  // 1. Fetch properties
  setUserPropertiesLoading(true);
  propertyService.getPropertiesByUserId(userId)
    .then(response => {
      console.log("response from properties", response.properties)
      setUserProperties(response.properties || []);
      setUserPropertiesLoading(false);
    })
    .catch(error => {
      console.error('Error fetching user properties:', error);
      message.error('Failed to load properties');
      setUserProperties([]);
      setUserPropertiesLoading(false);
    });
  
  // 2. Fetch payment history
  setUserPaymentsLoading(true);
  paymentService.getPaymentsByUserId(userId)
    .then(response => {
      console.log("response from payments", response.payments)
      setUserPayments(response.payments || []);
      setUserPaymentsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching user payments:', error);
      message.error('Failed to load payment history');
      setUserPayments([]);
      setUserPaymentsLoading(false);
    });
  
  // 3. Fetch token history
  setUserTokensLoading(true);
  tokenService.getTokensByUserId(userId)
    .then(response => {
      console.log("response from tokens", response.tokens)
      setUserTokens(response.tokens || []);
      setUserTokensLoading(false);
    })
    .catch(error => {
      console.error('Error fetching user tokens:', error);
      message.error('Failed to load token history');
      setUserTokens([]);
      setUserTokensLoading(false);
    });
};

  useEffect(() => {
    setLoading(true);
    userService
      .getUsers()
      .then((data) => {
        setStaffData(data);
        // console.log('response from api', data);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching users');
        console.log(error);
        setLoading(false);
      });
  }, []);

  const refreshState = () => {
    userService
      .getUsers()
      .then((data) => {
        setStaffData(data);
        // console.log('response from api', data);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching users');
        console.log(error);
        setLoading(false);
      });
  };
  // Departments for dropdown

  const handleDeleteEmployee = (id) => {
    userService
      .deleteUser(id)
      .then((response) => {
        console.log('response from api', response.data);
        message.success('User deleted successfully');
        refreshState();
      })
      .catch((error) => {
        message.error('Error deleting user');
        console.log(error);
      });
  };

  const prepareEditModal = (record) => {
    setSelectedEmployee(record);
    setIsEditEmployeeModalVisible(true);
  };

  const handleEditUser = (userId, values) => {
    setUpdateUserLoading(true);
    
    // Handle phone number formatting if needed
    if (values.phoneNumber && typeof values.phoneNumber === 'object') {
      const phoneData = values.phoneNumber;
      values.phoneNumber = `+${phoneData.countryCode}${phoneData.areaCode || ''}${phoneData.phoneNumber || ''}`;
    }
    
    // Make sure isVerified is explicitly included as a boolean
    if (values.isVerified !== undefined) {
      // No conversion needed as Switch component already returns boolean
      console.log('Updating isVerified status to:', values.isVerified);
    }
    
    userService
      .updateUser(userId, values) // This will include the isVerified value
      .then((response) => {
        setUpdateUserLoading(false);
        console.log('response from api', response.data);
        message.success('User successfully updated');
        refreshState();
        setIsEditEmployeeModalVisible(false);
      })
      .catch((error) => {
        setUpdateUserLoading(false);
        message.error('Error updating user');
        console.log(error);
      });
  };
  // Table columns configuration

  // console.log(staffData);

  // Updated filter logic to include role filtering
  const filteredData = staffData?.users?.filter(
    (item) => 
      item.firstName?.toLowerCase()?.includes(searchName?.toLowerCase()) && 
      item.id.toLowerCase()?.includes(searchId?.toLowerCase()) &&
      (searchRole === '' || (item?.role && item?.role?.toLowerCase()?.includes(searchRole?.toLowerCase())))
  );

  // Get unique roles for the dropdown
  const uniqueRoles = Array.from(new Set(staffData?.users?.filter(user => user.role).map(user => user.role)))
    .map(role => ({ label: role, value: role }));

  const columns = [
    // {
    //   title: 'User ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   sorter: (a, b) => a.id.localeCompare(b.id)
    // },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.first_name.localeCompare(b.name)
    },
    {
      title: 'Last name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.last_name.localeCompare(b.department)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) => <Tag color={isVerified ? 'green' : 'red'}>{isVerified ? 'Active' : 'Inactive'}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined 
            onClick={() => {
               setSelectedEmployee(record); // Keep this for consistency
    setSelectedUser(record);     // Add this line
    fetchUserDetails(record.id); // Pass the user ID here
            }} 
          />
          <EditOutlined onClick={() => prepareEditModal(record)} />
          <Tooltip title="assign role" color="blue">
            <PlusCircleOutlined
              onClick={() => {
                setSelectedEmployee(record);
                setIsRoleModalVisible(true);
              }}
            />
          </Tooltip>{' '}
          <Popconfirm
            title="Delete User"
            description="Are you sure to delete this user?"
            onConfirm={() => handleDeleteEmployee(record?.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Reset Filters Function - updated to include role
  const resetFilters = () => {
    setSearchName('');
    setSearchId('');
    setSearchRole('');
    message.info('Filters have been reset');
  };

  // Add employee handler

  return (
    <div className="p-4">
      <Card hoverable>
        <Space className="mb-4" wrap style={{ padding: '20px' }}>
          <Input
            placeholder="Search by Name"
            prefix={<SearchOutlined />}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 300 }}
          />
          <Input
            placeholder="Search by ID"
            prefix={<SearchOutlined />}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ width: 300 }}
          />
          {/* New Select component for role filtering */}
          <Select
            placeholder="Filter by Role"
            style={{ width: 200 }}
            value={searchRole}
            onChange={(value) => setSearchRole(value)}
            allowClear
            options={uniqueRoles}
          />

          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            Reset Filters
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddEmployeeModalVisible(true)}>
            Add User
          </Button>
        </Space>

        <Divider />

        <Table
          columns={columns}
          dataSource={filteredData}
          size="small"
          style={{ padding: '20px' }}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Add Employee Modal */}
      <Modal title="Add New Employee" open={isAddEmployeeModalVisible} onCancel={() => setIsAddEmployeeModalVisible(false)} footer={null}>
        <CreateNewUserModal  refreshState={refreshState} setIsAddEmployeeModalVisible={setIsAddEmployeeModalVisible} />
        
      </Modal>

      {/* Employee Details Drawer */}
      {/* // Add this drawer component to your JSX return section */}
<Drawer
  title={
    <Space>
      <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>User Details</span>
    </Space>
  }
  placement="right"
  width={700}
  onClose={() => setIsDetailsDrawerVisible(false)}
  open={isDetailsDrawerVisible}
  
>
  {selectedUser && (
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
            <Avatar
              size={64} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }} 
            />
          </Col>
          <Col flex="auto">
            <h2 style={{ color: 'white', margin: 0 }}>
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue" style={{ borderRadius: '12px' }}>
                {selectedUser.role || 'No Role Assigned'}
              </Tag>
              <Badge
                status={selectedUser.isVerified ? 'success' : 'error'}
                text={selectedUser.isVerified ? 'Verified' : 'Unverified'}
                style={{ marginLeft: '8px', color: 'white' }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Content Sections */}
      <div style={{ padding: '16px 24px' }}>
        {/* Personal Information Section */}
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
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Personal Information</span>
          </div>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#8c8c8c', fontSize: '12px' }}>User ID</div>
                <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedUser.id?.slice(0, 8)}...</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Email</div>
                <div style={{ fontWeight: '500', marginTop: '4px' }}>{selectedUser.email}</div>
              </div>
            </Col>

            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                <PhoneOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#fa541c' }} />
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Phone Number</div>
                  <div style={{ fontWeight: '500' }}>{selectedUser.phoneNumber || 'Not provided'}</div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                <CalendarOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#722ed1' }} />
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Registration Date</div>
                  <div style={{ fontWeight: '500' }}>
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Not available'}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Properties Section */}
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
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Properties</span>
          </div>

          {userPropertiesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : userProperties.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={userProperties}
              renderItem={(property) => (
                <List.Item>
                  <Card style={{ width: '100%', borderRadius: '8px' }} hoverable>
                    <Row align="middle" gutter={16}>
                      <Col span={4}>
                        <div
                          style={{
                            backgroundColor: '#e6f7ff',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
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
                        <div style={{ textAlign: 'center' }}>
                          <Tooltip title="View Property Details">
                            <Button 
                              type="primary" 
                              shape="circle" 
                              icon={<EyeOutlined />} 
                              size="small" 
                              style={{ marginRight: '8px' }}
                              onClick={() => {
                                // Add your property details view function here
                                // viewPropertyDetails(property.id);
                                message.info(`View property ${property.id}`);
                              }}
                            />
                          </Tooltip>
                        </div>
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
                <span style={{ color: '#8c8c8c' }}>No properties found for this user</span>
              }
            />
          )}
        </div>

        {/* Payments & Transaction History */}
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
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Payment History</span>
          </div>

          {userPaymentsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : userPayments.length > 0 ? (
            <Table
              dataSource={userPayments}
              pagination={{ pageSize: 3 }}
              size="small"
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (text) => new Date(text).toLocaleDateString()
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
                  title: 'Method',
                  dataIndex: 'paymentMethod',
                  key: 'paymentMethod',
                  render: (method) => <Tag color="blue">{method}</Tag>
                },
                {
                  title: 'Reference',
                  dataIndex: 'referenceNumber',
                  key: 'referenceNumber'
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge
                      status={status === 'Completed' ? 'success' : 'processing'}
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
                <span style={{ color: '#8c8c8c' }}>No payment history available</span>
              }
            />
          )}
        </div>

        {/* Token Purchase History */}
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
            <IoWaterOutline style={{ marginRight: '8px', color: '#faad14' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Token Purchase History</span>
          </div>

          {userTokensLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : userTokens.length > 0 ? (
            <Table
              dataSource={userTokens}
              pagination={{ pageSize: 3 }}
              size="small"
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
                  title: 'Property',
                  dataIndex: 'propertyName',
                  key: 'propertyName'
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
      </div>
    </div>
  )}
</Drawer>

      <Modal title="Edit Employee" open={isEditEmployeeModalVisible} onCancel={() => setIsEditEmployeeModalVisible(false)} footer={null}>
        <UpdateUserModal handleUpdateUser={handleEditUser} selectedEmployee={selectedEmployee} loading={updateUserLoading} />
      </Modal>

      <Modal title="Assign Role" open={isRoleModalVisible} onCancel={() => setIsRoleModalVisible(false)} footer={null}>
        <AssignRoleModal
          userId={selectedEmployee?.id}
          refreshState={refreshState}
          setIsRoleModalVisible={setIsRoleModalVisible}
          userRoles={selectedEmployee?.roles || []}
          onSuccess={() => setIsRoleModalVisible(false)}
        />
      </Modal>
    </div>
  );
}