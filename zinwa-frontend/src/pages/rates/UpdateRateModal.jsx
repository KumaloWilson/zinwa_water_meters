import { DollarOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, DatePicker, Switch, InputNumber, message } from 'antd';
import React, { useState, useEffect } from 'react';
import rateService from '../../services/rateService/rateService';
import moment from 'moment';


export default function UpdateRateModal({setIsEditDrawerVisible, refreshState, selectedRate , rateID}) {
  const [rateForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
console.log(selectedRate)
  // Initialize form with current rate data when component mounts or selectedRate changes
  useEffect(() => {
    if (selectedRate) {
      rateForm.setFieldsValue({
        ratePerUnit: selectedRate.ratePerUnit,
        fixedCharge: selectedRate.fixedCharge,
        minimumCharge: selectedRate.minimumCharge,
        isActive: selectedRate.isActive !== false, // Default to true if not explicitly false
        endDate: selectedRate.endDate ? moment(selectedRate.endDate) : null,
        description: selectedRate.description || ''
      });
    }
  }, [selectedRate, rateForm]);


  
  // Handle form submission
  const handleSubmit = (values) => {
    setLoading(true);
    
    const rateData = {
      ratePerUnit: values.ratePerUnit,
      fixedCharge: values.fixedCharge,
      minimumCharge: values.minimumCharge,
      isActive: values.isActive,
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      description: values.description
    };

    rateService.updateRate(rateID, rateData)
      .then((response) => {
        message.success(`Successfully Updated Rate`);
        setIsEditDrawerVisible(false);
        refreshState();
      })
      .catch((error) => {
        console.error('Error updating rate:', error);
        message.error('Failed to update rate');
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
        
      >
        <Row gutter={16}>
          <Col span={24}>
            <div className="rate-info">
              <h3>Update Rate for: {selectedRate?.propertyType} Properties</h3>
            </div>
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
          <Col span={8}>
            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select end date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Update Rate
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}