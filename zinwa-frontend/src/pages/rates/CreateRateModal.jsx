import { DollarOutlined, HomeOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, DatePicker, Select, InputNumber, message } from 'antd';
import React, { useState } from 'react';
import rateService from '../../services/rateService/rateService';

export default function CreateRateModal({setIsCreateDrawerVisible, refreshState}) {
  const [rateForm] = Form.useForm();
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes to update formValues state
  const handleInputChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  // Handle form submission
  const handleSubmit = (values) => {
    setLoading(true);
    
    const rateData = {
      propertyType: values.propertyType,
      ratePerUnit: values.ratePerUnit,
      fixedCharge: values.fixedCharge,
      minimumCharge: values.minimumCharge,
      effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
      description: values.description
    };

    rateService.createRate(rateData)
      .then((response) => {
        message.success(`Successfully Created Rate for ${values.propertyType} properties`);
        rateForm.resetFields();
        setIsCreateDrawerVisible(false);
        refreshState();
      })
      .catch((error) => {
        console.error('Error creating rate:', error);
        message.error('Failed to create rate');
      })
      .finally(() => {
        setLoading(false);
      });
  };

 

  return (
    <div>
      <Form
        form={rateForm}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleInputChange}
        // initialValues={{
        //   propertyType: 'residential',
        //   ratePerUnit: 0.15,
        //   fixedCharge: 5.00,
        //   minimumCharge: 3.00,
        //   effectiveDate: moment('2025-01-01'),
        //   description: 'Standard rate for residential properties'
        // }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="propertyType"
              label="Property Type"
              rules={[{ required: true, message: 'Please select property type' }]}
            >
              <Select prefix={<HomeOutlined />}>
                <Select.Option value="residential_low_density">Residential (Low Density)</Select.Option>
                <Select.Option value="residential_high_density">Residential (High Density)</Select.Option>
                <Select.Option value="commercial">Commercial</Select.Option>
                <Select.Option value="industrial">Industrial</Select.Option>
                <Select.Option value="agricultural">Agricultural</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="ratePerUnit"
              label="Rate Per Unit"
              rules={[
                { required: true, message: 'Please enter rate per unit' },
                { type: 'number', min: 0, message: 'Rate must be a positive number' }
              ]}
            >
              <InputNumber 
                prefix={<DollarOutlined />} 
                step={0.01} 
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="fixedCharge"
              label="Fixed Charge"
              rules={[
                { required: true, message: 'Please enter fixed charge' },
                { type: 'number', min: 0, message: 'Fixed charge must be a positive number' }
              ]}
            >
              <InputNumber 
                prefix={<DollarOutlined />} 
                step={0.01} 
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="minimumCharge"
              label="Minimum Charge"
              rules={[
                { required: true, message: 'Please enter minimum charge' },
                { type: 'number', min: 0, message: 'Minimum charge must be a positive number' }
              ]}
            >
              <InputNumber 
                prefix={<DollarOutlined />} 
                step={0.01} 
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="effectiveDate"
              label="Effective Date"
              rules={[{ required: true, message: 'Please select effective date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input prefix={<FileTextOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Rate
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}