import React, { useState, useEffect } from 'react';
import { Form, Input, Button, List, Avatar, message, Spin, Empty } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import userService from '../../services/userService/userService';

export default function ChangeOwnerModal({ propertyId, currentOwnerId, handleChangeOwner, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    setLoading(true);

    userService
      .getUsers()
      .then((data) => {
        setUsers(data?.users);
        setFilteredUsers(data?.users);
        setLoading(false);
      })
      .catch((error) => {
        message.error('Error fetching users');
        console.log(error);
        setLoading(false);
      });
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    if (value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users?.filter((user) => user.firstName.toLowerCase().includes(value) || user.lastName.toLowerCase().includes(value));
      setFilteredUsers(filtered);
    }
  };

  // Handle user selection
  const selectUser = (userId) => {
    setSelectedUserId(userId);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedUserId) {
      message.warning('Please select a new owner');
      return;
    }

    try {
      setSubmitting(true);
      await handleChangeOwner(propertyId, selectedUserId);
      message.success('Property owner updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error changing property owner:', error);
      message.error('Failed to update property owner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search users by name"
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={handleSearch}
          style={{ marginBottom: 16 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin />
        </div>
      ) : (
        <>
          {filteredUsers.length > 0 ? (
            <List
              style={{ maxHeight: '400px', overflow: 'auto', marginBottom: 16 }}
              itemLayout="horizontal"
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  onClick={() => selectUser(user.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user.id ? '#f0f7ff' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`${user.firstName} ${user.lastName}`}
                    description={user.email}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No users found" />
          )}
        </>
      )}

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="default" onClick={onSuccess} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={submitting} disabled={!selectedUserId}>
          Change Owner
        </Button>
      </div>
    </div>
  );
}
