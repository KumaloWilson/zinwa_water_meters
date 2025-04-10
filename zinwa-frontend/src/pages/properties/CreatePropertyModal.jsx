import { HomeOutlined, EnvironmentOutlined, NumberOutlined, CompassOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, message, Spin, Divider } from 'antd';
import React, { useState, useEffect } from 'react';

// Map imports - properly using ES6 import syntax
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import propertyService from '../../services/propertiesService/propertiesService';

export default function CreateNewPropertyModal({ setIsAddPropertyModalVisible, refreshState }) {
  const [addPropertyForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: -17.8252, // Default center (Harare)
    lng: 31.0335
  });
  const [markerPosition, setMarkerPosition] = useState(null);

  // Property types for the dropdown
  const propertyTypes = [
    { value: 'residential_low_density', label: 'Residential(Low density)' },
    { value: 'residential_high_density', label: 'Residential(High density)' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' }
  ];

  // Google Maps container style
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
    marginBottom: '16px'
  };

  // Try to get user's current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(currentLocation);
          setMarkerPosition(currentLocation);
          updateLatLngFields(currentLocation);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Use default location if user location unavailable
          setMarkerPosition(mapCenter);
          updateLatLngFields(mapCenter);
        }
      );
    }
  }, []);

  // Update form fields when marker position changes
  const updateLatLngFields = (position) => {
    addPropertyForm.setFieldsValue({
      latitude: position.lat.toFixed(6),
      longitude: position.lng.toFixed(6)
    });
  };

  // Handle map click to set marker
  const handleMapClick = (event) => {
    const clickedPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarkerPosition(clickedPosition);
    updateLatLngFields(clickedPosition);
  };

  // Update marker when lat/lng fields change manually
  const handleCoordinateChange = () => {
    const latitude = parseFloat(addPropertyForm.getFieldValue('latitude'));
    const longitude = parseFloat(addPropertyForm.getFieldValue('longitude'));
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      const newPosition = { lat: latitude, lng: longitude };
      setMarkerPosition(newPosition);
      setMapCenter(newPosition);
    }
  };

  // Handle form submission
  const handleSubmit = (values) => {
    setLoading(true);
    
    const propertyData = {
      userId: values.userId,
      propertyName: values.propertyName,
      address: values.address,
      meterNumber: values.meterNumber,
      propertyType: values.propertyType,
      city: values.city,
      province: values.province,
      postalCode: values.postalCode,
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude)
    };

    propertyService.registerProperty(propertyData)
      .then((response) => {
        message.success(`Successfully Created Property: ${values.propertyName}`);
        addPropertyForm.resetFields();
        setIsAddPropertyModalVisible(false);
        refreshState();
      })
      .catch((error) => {
        console.error('Error creating property:', error);
        message.error('Failed to create property');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
        <div>
        <span style={{ color: 'blue', fontWeight: 'bold' , fontSize: '20px', padding: '10px'}}>Add New Property</span>
        <Divider />
        </div>
      <Form
        form={addPropertyForm}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="userId"
              label="User ID"
              rules={[{ required: true, message: 'Please enter user ID' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row> */}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="propertyName"
              label="Property Name"
              rules={[{ required: true, message: 'Please enter property name' }]}
            >
              <Input prefix={<HomeOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="propertyType"
              label="Property Type"
              rules={[{ required: true, message: 'Please select property type' }]}
            >
              <Select options={propertyTypes} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input prefix={<EnvironmentOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: 'Please enter postal code' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please enter city' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="province"
              label="Province"
              rules={[{ required: true, message: 'Please enter province' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="meterNumber"
              label="Meter Number"
              rules={[{ required: true, message: 'Please enter meter number' }]}
            >
              <Input prefix={<NumberOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Property Location">
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <LoadScript 
              googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"
              onLoad={() => setMapLoaded(true)}
            >
              {!mapLoaded && (
                <div style={{ ...mapContainerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Spin tip="Loading map..." />
                </div>
              )}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
              >
                {markerPosition && <Marker position={markerPosition} draggable={true} onDragEnd={(e) => {
                  const newPosition = { 
                    lat: e.latLng.lat(), 
                    lng: e.latLng.lng() 
                  };
                  setMarkerPosition(newPosition);
                  updateLatLngFields(newPosition);
                }} />}
              </GoogleMap>
            </LoadScript>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Click on the map to set location or drag the marker
              </p>
            </div>
          </div>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[
                { required: true, message: 'Please enter latitude' },
                {
                  pattern: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,8})?$/,
                  message: 'Please enter a valid latitude (-90 to 90)'
                }
              ]}
            >
              <Input 
                prefix={<CompassOutlined />} 
                onChange={handleCoordinateChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[
                { required: true, message: 'Please enter longitude' },
                {
                  pattern: /^-?((1?[0-7]?|[0-9]?)[0-9]|180)(\.[0-9]{1,8})?$/,
                  message: 'Please enter a valid longitude (-180 to 180)'
                }
              ]}
            >
              <Input 
                prefix={<CompassOutlined />} 
                onChange={handleCoordinateChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Add Property
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}