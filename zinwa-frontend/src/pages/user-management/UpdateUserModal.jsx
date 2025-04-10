import { Button, Form, Input, message } from 'antd';
import React, { useEffect } from 'react';

export default function UpdateUserModal({ handleUpdateUser, selectedEmployee  }) {
  const [editEmployeeForm] = Form.useForm();
  
  // When selectedEmployee changes, reset form fields with that data
  useEffect(() => {
    if (selectedEmployee) {
      editEmployeeForm.setFieldsValue({
        phoneNumber: selectedEmployee.phoneNumber,
        email: selectedEmployee.email,
        address: selectedEmployee.address,
      });
    }
  }, [selectedEmployee, editEmployeeForm]);

  const handleSubmit = (values) => {
    // Call the parent's handleUpdateUser function with the user ID and updated values
    handleUpdateUser(selectedEmployee.id, values);
  };

  return (
    <Form form={editEmployeeForm} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="phoneNumber"
        label="Phone Number"
        rules={[
          { required: true, message: 'Please enter your phone number' },
          {
            pattern: /^\+[0-9]{1,3}[0-9\s.-]{7,}$/,
            message: 'Phone number must start with + followed by country code'
          }
        ]}
      >
        <Input placeholder="+1 234 567 8900" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter email' },
          {
            type: 'email',
            message: 'Please enter a valid email address'
          }
        ]}
      >
        <Input placeholder="example@domain.com" />
      </Form.Item>

      <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter your address' }]}>
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}   block>
          Update Employee
        </Button>
      </Form.Item>
    </Form>
  );
}