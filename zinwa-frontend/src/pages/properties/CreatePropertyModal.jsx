import { HomeOutlined, EnvironmentOutlined, NumberOutlined, CompassOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, message, Spin, Divider } from 'antd';
import React, { useState, useEffect, useRef } from 'react';

// Mapbox imports
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import propertyService from '../../services/propertiesService/propertiesService';
import userService from '../../services/userService/userService';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbmdla2UiLCJhIjoiY205aWk0dGE0MDJhazJpc2JoZWpkdHQ2eiJ9.92acewFg9hcRIFbpVD0Q4g';
 
// Zimbabwe provinces and cities data
const zimbabweData = {
  'Harare': ['Harare'],
  'Bulawayo': ['Bulawayo'],
  'Manicaland': ['Mutare', 'Chipinge', 'Rusape', 'Nyanga'],
  'Mashonaland Central': ['Bindura', 'Mt Darwin', 'Mazowe', 'Centenary', 'Shamva'],
  'Mashonaland East': ['Marondera', 'Murehwa', 'Mutoko', 'Chivhu', 'Goromonzi'],
  'Mashonaland West': ['Chinhoyi', 'Kariba', 'Kadoma', 'Chegutu', 'Norton', 'Mhangura'],
  'Masvingo': ['Masvingo', 'Chiredzi', 'Gutu', 'Triangle', 'Zaka', 'Jerera'],
  'Matabeleland North': ['Hwange', 'Victoria Falls', 'Lupane', 'Binga', 'Tsholotsho'],
  'Matabeleland South': ['Gwanda', 'Beitbridge', 'Plumtree', 'Filabusi', 'Esigodini'],
  'Midlands': ['Gweru', 'Kwekwe', 'Zvishavane', 'Shurugwi', 'Gokwe', 'Mberengwa']
};

export default function CreateNewPropertyModal({ setIsAddPropertyModalVisible, refreshState }) {
  const [addPropertyForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({
    lat: -17.8252, // Default center (Harare)
    lng: 31.0335
  });
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [provinces] = useState(Object.keys(zimbabweData));
  
  // Refs for map and marker
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Property types for the dropdown
  const propertyTypes = [
    { value: 'residential_low_density', label: 'Residential(Low density)' },
    { value: 'residential_high_density', label: 'Residential(High density)' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' }
  ];

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  };

  // Initialize Mapbox when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarkerPosition(currentLocation);
          updateLatLngFields(currentLocation);
          initializeMap(currentLocation);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Use default location if user location unavailable
          initializeMap(markerPosition);
          updateLatLngFields(markerPosition);
        }
      );
    } else {
      // Fallback to default location if geolocation not available
      initializeMap(markerPosition);
      updateLatLngFields(markerPosition);
    }
  }, []);

  // Initialize Mapbox map
  const initializeMap = (center) => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.lng, center.lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([center.lng, center.lat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      const newPosition = {
        lat: lngLat.lat,
        lng: lngLat.lng
      };
      setMarkerPosition(newPosition);
      updateLatLngFields(newPosition);
    });

    // Handle map click to set marker
    map.current.on('click', (e) => {
      const clickedPosition = {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      };
      setMarkerPosition(clickedPosition);
      updateLatLngFields(clickedPosition);
      marker.current.setLngLat([clickedPosition.lng, clickedPosition.lat]);
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });
  };

  // Update form fields when marker position changes
  const updateLatLngFields = (position) => {
    addPropertyForm.setFieldsValue({
      latitude: position.lat.toFixed(6),
      longitude: position.lng.toFixed(6)
    });
  };

  // Update marker when lat/lng fields change manually
  const handleCoordinateChange = () => {
    const latitude = parseFloat(addPropertyForm.getFieldValue('latitude'));
    const longitude = parseFloat(addPropertyForm.getFieldValue('longitude'));
    
    if (!isNaN(latitude) && !isNaN(longitude) && map.current && marker.current) {
      const newPosition = { lat: latitude, lng: longitude };
      setMarkerPosition(newPosition);
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({ center: [longitude, latitude] });
    }
  };

  // Handle province change to update cities dropdown
  const handleProvinceChange = (value) => {
    setCities(zimbabweData[value] || []);
    addPropertyForm.setFieldsValue({ city: undefined });
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

    console.log('Property Data:', propertyData);

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
        <span style={{ color: 'blue', fontWeight: 'bold', fontSize: '20px', padding: '10px'}}>Add New Property</span>
        <Divider />
      </div>
      <Form
        form={addPropertyForm}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="userId"
              label="Property Owner"
              rules={[{ required: true, message: 'Please select a property owner' }]}
            >
              <Select
                placeholder="Select a property owner"
                loading={userLoading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                prefix={<UserOutlined />}
              >
                {users.map(user => (
                  <Select.Option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
              name="province"
              label="Province"
              rules={[{ required: true, message: 'Please select province' }]}
            >
              <Select 
                placeholder="Select province" 
                onChange={handleProvinceChange}
              >
                {provinces.map(province => (
                  <Select.Option key={province} value={province}>{province}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please select city' }]}
            >
              <Select placeholder="Select city" disabled={cities.length === 0}>
                {cities.map(city => (
                  <Select.Option key={city} value={city}>{city}</Select.Option>
                ))}
              </Select>
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
            <div 
              ref={mapContainer} 
              style={{ 
                width: '100%', 
                height: '400px', 
                borderRadius: '8px',
                marginBottom: '16px' 
              }}
            >
              {!mapLoaded && (
                <div style={{ 
                  width: '100%', 
                  height: '400px',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  borderRadius: '8px',
                  background: '#f0f2f5'
                }}>
                  <Spin tip="Loading map..." />
                </div>
              )}
            </div>
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