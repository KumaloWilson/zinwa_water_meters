import { HomeOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, message } from 'antd';
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService/userService';
import PhoneInput  from 'antd-phone-input';
// import 'antd-phone-input/dist/index.css';

export default function CreateNewUserModal({setIsAddEmployeeModalVisible, refreshState}) {
  const [addEmployeeForm] = Form.useForm();
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
   
  // Watch first_name and last_name fields to auto-generate username
  useEffect(() => {
    const { firstName, lastName } = formValues;
    
    if (firstName && lastName) {
      // Create username from first letter of first name and full last name
      const generatedUsername = (firstName.charAt(0) + lastName).toLowerCase()
        .replace(/\s+/g, '') // Remove spaces
        .replace(/[^a-z0-9]/g, ''); // Remove special characters
      
      addEmployeeForm.setFieldsValue({ username: generatedUsername });
    }
  }, [formValues.firstName, formValues.lastName, addEmployeeForm]);

  // Handle input changes to update formValues state
  const handleInputChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  // Handle form submission
  const handleSubmit = (values) => {
    setLoading(true);
    if (values.phoneNumber && typeof values.phoneNumber === 'object') {
      const phoneData = values.phoneNumber;
      values.phoneNumber = `+${phoneData.countryCode}${phoneData.areaCode || ''}${phoneData.phoneNumber || ''}`;
    }
    
    const userData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      username: values.username,
      role: "customer"
    };
console.log(userData)
    userService.createUser(userData)
      .then((response) => {
        message.success(`Successfully Created User: ${values.firstName} ${values.lastName}`);
        addEmployeeForm.resetFields();
        setIsAddEmployeeModalVisible(false);
        refreshState();
      })
      .catch((error) => {
        console.error('Error creating user:', error);
        message.error('Failed to create user');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Form
        form={addEmployeeForm}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleInputChange}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter phone number' },
                {
                  pattern: /^\+[0-9]{1,3}[0-9\s.-]{7,}$/,
                  message: 'Phone number must start with + followed by country code'
                }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+263 778 123456" />
            </Form.Item>
          </Col> */}
          <Col span={12}>
  <Form.Item
    name="phoneNumber"
    label="Phone Number"
    rules={[
      { required: true, message: 'Please enter phone number' }
    ]}
    // Transform the complex object into a simple string format
    getValueProps={(value) => {
      return { value }; // Pass through the value as-is for the component
    }}
    // When form collects values, transform from complex object to simple string
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
</Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter username' },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Add User
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}