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
  DatePicker
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
  PlusCircleOutlined
} from '@ant-design/icons';
// import { SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import CreateNewUserModal from './CreateNewUserModal';
import userService from '../../services/userService/userService';
import UpdateUserModal from './UpdateUserModal';
import AssignRoleModal from './AssignUserRole';

export default function UserManagement() {
  //   const {  user } = useUser();
  //   console.log(user?.username)
  //   console.log(user)

  // Enhanced staff data with more fields
  const [staffData, setStaffData] = useState([]);

  // State for filtering and modals
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  //   const [searchDepartment, setSearchDepartment] = useState('');
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditEmployeeModalVisible, setIsEditEmployeeModalVisible] = useState(false);
  const [editEmployeeForm] = Form.useForm();
  const [addEmployeeForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

  useEffect(() => {
    setLoading(true);

    userService
      .getUsers()
      .then((data) => {
        setStaffData(data);
        console.log('response from api', data);
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
        console.log('response from api', data);
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
    userService
      .updateUser(userId, values) // Make sure to pass the values to your API
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

  console.log(staffData);

  const filteredData = staffData?.users?.filter(
    (item) => item.firstName.toLowerCase()?.includes(searchName?.toLowerCase()) && item.id.toLowerCase()?.includes(searchId?.toLowerCase())
  );

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
          {/* <EyeOutlined 
            onClick={() => {
              setSelectedEmployee(record);
              setIsDetailsDrawerVisible(true);
            }} 
          /> */}
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

  // Reset Filters Function
  const resetFilters = () => {
    setSearchName('');
    setSearchId('');
    // setSearchDepartment('');
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
      <Drawer
        title="Employee Details"
        placement="right"
        width={400}
        onClose={() => setIsDetailsDrawerVisible(false)}
        open={isDetailsDrawerVisible}
      >
        {selectedEmployee && (
          <Card>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Employee ID:</strong> {selectedEmployee.id}
              </Col>
              <Col span={12}>
                <strong>Status:</strong>
                <Tag color={selectedEmployee.isActive ? 'green' : 'red'}>{selectedEmployee.isActive ? 'Active' : 'Inactive'}</Tag>
              </Col>
            </Row>

            <Divider orientation="left">Personal Information</Divider>
            <p>
              <UserOutlined /> <strong>Name:</strong> {selectedEmployee.name}
            </p>
            <p>
              <MailOutlined /> <strong>Email:</strong> {selectedEmployee.email}
            </p>
            <p>
              <PhoneOutlined /> <strong>Phone:</strong> {selectedEmployee.phone}
            </p>
            <p>
              <HomeOutlined /> <strong>Address:</strong> {selectedEmployee.address}
            </p>

            <Divider orientation="left">Professional Details</Divider>
            <p>
              <strong>Department:</strong> {selectedEmployee.department}
            </p>
            <p>
              <strong>Position:</strong> {selectedEmployee.position}
            </p>
          </Card>
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
