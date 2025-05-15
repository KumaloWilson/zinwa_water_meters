import { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Checkbox, message, Select } from 'antd';
import dayjs from 'dayjs';
import propertyService from '../../services/propertiesService/propertiesService';
import meterReadingsService from '../../services/meterReadingsService/meterReadingsService';

export default function UpdateReadingModal ({ refreshState, setIsEditModalVisible, selectedReading, readingId })  {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties when component mounts
  useEffect(() => {
    fetchPropertyOptions();
  }, []);

  // Update form values when selectedReading changes
  useEffect(() => {
    if (selectedReading) {
      form.setFieldsValue({
        ...selectedReading,
        readingDate: selectedReading.readingDate ? dayjs(selectedReading.readingDate) : null,
      });
      
      if (selectedReading.propertyId) {
        setSelectedProperty(selectedReading.propertyId);
      }
    }
  }, [selectedReading, form]);

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

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Explicitly format all values to match the expected types
      const formattedValues = {
        propertyId: values.propertyId,
        reading: parseFloat(values.reading),
        consumption: parseFloat(values.consumption),
        readingDate: values.readingDate ? values.readingDate.toISOString() : dayjs().toISOString(),
        isEstimated: values.isEstimated === true,
        notes: values.notes || ""
      };
      
      console.log('Updating reading:', readingId, formattedValues);
      
      // Use the service to update the reading
      const response = await meterReadingsService.updateMeterReading(readingId, formattedValues);
      console.log('Response:', response);
      
      message.success('Reading updated successfully');
      refreshState(); // Refresh the parent component
      setIsEditModalVisible(false); // Close the modal
    } catch (error) {
      console.error('Error updating reading:', error);
      message.error(`Failed to update reading: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="propertyId"
        label="Property"
        rules={[{ required: true, message: 'Please select a property' }]}
      >
        <Select
          placeholder="Select a property"
          options={propertyOptions}
          loading={loading && propertyOptions.length === 0}
          onChange={(value) => setSelectedProperty(value)}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="reading"
        label="Meter Reading"
        rules={[{ required: true, message: 'Please enter the meter reading' }]}
      >
        <Input type="number" placeholder="Enter meter reading" />
      </Form.Item>

      <Form.Item
        name="consumption"
        label="Consumption"
        rules={[{ required: true, message: 'Please enter the consumption' }]}
      >
        <Input type="number" placeholder="Enter consumption" />
      </Form.Item>

      <Form.Item
        name="readingDate"
        label="Reading Date"
        rules={[{ required: true, message: 'Please select a date' }]}
      >
        <DatePicker 
          showTime 
          format="YYYY-MM-DD HH:mm:ss" 
          style={{ width: '100%' }} 
        />
      </Form.Item>

      <Form.Item
        name="isEstimated"
        valuePropName="checked"
      >
        <Checkbox>Estimated Reading</Checkbox>
      </Form.Item>

      <Form.Item
        name="notes"
        label="Notes"
      >
        <Input.TextArea rows={4} placeholder="Add any notes about this reading" />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => setIsEditModalVisible(false)} 
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            Update Reading
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

