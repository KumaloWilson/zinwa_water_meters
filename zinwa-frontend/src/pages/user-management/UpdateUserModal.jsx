import { Button, Form, Input, message, Switch } from 'antd';
import PhoneInput from 'antd-phone-input';
import React, { useEffect } from 'react';

export default function UpdateUserModal({ handleUpdateUser, selectedEmployee, loading }) {
  const [editEmployeeForm] = Form.useForm();
  
  // When selectedEmployee changes, reset form fields with that data
  useEffect(() => {
    if (selectedEmployee) {
      editEmployeeForm.setFieldsValue({
        phoneNumber: selectedEmployee.phoneNumber,
        email: selectedEmployee.email,
        address: selectedEmployee.address,
        isVerified: selectedEmployee.isVerified, // Add isVerified field
      });
    }
  }, [selectedEmployee, editEmployeeForm]);

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    // Call the parent's handleUpdateUser function with the user ID and updated values
    handleUpdateUser(selectedEmployee.id, values);
  };

  return (
    <Form form={editEmployeeForm} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="phoneNumber"
        label="Phone Number"
        rules={[
          { required: true, message: 'Please enter phone number' }
        ]}
        getValueProps={(value) => {
          return { value }; // Pass through the value as-is for the component
        }}
        getValueFromEvent={(data) => {
          if (!data) return undefined;
          
          // Format as international number: +[countryCode][areaCode][phoneNumber]
          return `+${data.countryCode}${data.areaCode || ''}${data.phoneNumber || ''}`;
        }}
      >
        <PhoneInput
          defaultCountry="zw" 
          placeholder="778 123456"
        />
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

      <Form.Item 
        name="address" 
        label="Address" 
        rules={[{ required: true, message: 'Please enter your address' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="isVerified"
        label="Account Status"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Active" 
          unCheckedChildren="Inactive" 
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Update Employee
        </Button>
      </Form.Item>
    </Form>
  );
}