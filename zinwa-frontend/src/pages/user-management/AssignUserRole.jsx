import React, { useState } from 'react';
import { Modal, Button, Form, Select, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import userService from '../../services/userService/userService';

function AssignRoleModal({ userId, refreshState, setIsRoleModalVisible }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'customer', label: 'Customer' },
  ];

  

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Call your API service to assign the role
    userService.updateUserRole(userId, values.role)
      .then((response) => {
        message.success('Role assigned successfully');
        refreshState(); // Refresh parent component data
        setIsRoleModalVisible(false);
      })
      .catch((error) => {
        message.error('Error assigning role');
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      
      
     
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="role"
            label="Select Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select a role"
              options={roles}
          
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Assign Role
            </Button>
          </Form.Item>
        </Form>
    </>
  );
}

export default AssignRoleModal;