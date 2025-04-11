import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';

export default function UserStatistics({ userData }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    verificationRate: 0,
    roleDistribution: {},
    recentActivity: 0,
    inactiveUsers: 0
  });

  useEffect(() => {
    if (userData?.users && userData.users.length > 0) {
      // Calculate statistics
      const totalUsers = userData.users.length;
      const verifiedUsers = userData.users.filter(user => user.isVerified).length;
      const verificationRate = (verifiedUsers / totalUsers) * 100;
      
      // Calculate role distribution
      const roleDistribution = {};
      userData.users.forEach(user => {
        if (!roleDistribution[user.role]) {
          roleDistribution[user.role] = 0;
        }
        roleDistribution[user.role]++;
      });
      
      // Calculate recent activity (users who logged in within the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = userData.users.filter(user => {
        return user.lastLogin && new Date(user.lastLogin) > thirtyDaysAgo;
      }).length;
      
      // Calculate inactive users (never logged in)
      const inactiveUsers = userData.users.filter(user => user.lastLogin === null).length;

      setStats({
        totalUsers,
        verifiedUsers,
        verificationRate,
        roleDistribution,
        recentActivity,
        inactiveUsers
      });
    }
  }, [userData]);

  // Prepare role data for display
  const roleData = Object.entries(stats.roleDistribution).map(([role, count]) => ({
    role: role.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
    count,
    percentage: (count / stats.totalUsers) * 100
  }));

  return (
    <Card title="User Statistics Dashboard" className="mb-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Total Users" 
              value={stats.totalUsers} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Verified Users" 
              value={stats.verifiedUsers} 
              prefix={<CheckCircleOutlined />} 
              suffix={`/ ${stats.totalUsers}`}
            />
            <Progress percent={Math.round(stats.verificationRate)} status="active" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Recent Activity" 
              value={stats.recentActivity} 
              prefix={<ClockCircleOutlined />} 
              suffix={`/ ${stats.totalUsers}`}
            />
            <Progress 
              percent={Math.round((stats.recentActivity / stats.totalUsers) * 100)} 
              status="active" 
              strokeColor="#1890ff" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Inactive Users" 
              value={stats.inactiveUsers} 
              prefix={<UserOutlined />} 
              suffix={`/ ${stats.totalUsers}`}
            />
            <Progress 
              percent={Math.round((stats.inactiveUsers / stats.totalUsers) * 100)} 
              status="exception" 
            />
          </Card>
        </Col>
      </Row>
      
      <Divider>Role Distribution</Divider>
      
      <Row gutter={[16, 16]}>
        {roleData.map(item => (
          <Col xs={24} sm={12} md={8} key={item.role}>
            <Card bordered={false}>
              <Statistic 
                title={item.role} 
                value={item.count} 
                suffix={`(${Math.round(item.percentage)}%)`} 
              />
              <Progress percent={Math.round(item.percentage)} strokeColor="#52c41a" />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}