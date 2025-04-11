// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined,
  UsergroupAddOutlined,
  HomeOutlined,
  MoneyCollectOutlined,
  AlertOutlined,
  ReadOutlined,
  DollarOutlined 
  
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  UsergroupAddOutlined,
  HomeOutlined,
  MoneyCollectOutlined,
  AlertOutlined,
  ReadOutlined,
  DollarOutlined
   
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: '',
  type: 'group',
  children: [
    {
      id: 'util-admin-dashboard',
      title: 'Admin Dashboard',
      type: 'item',
      url: '/admin-dashboard',
      icon: icons.UsergroupAddOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: icons.UsergroupAddOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-properties',
      title: 'Properties',
      type: 'item',
      url: '/properties',
      icon: icons.HomeOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-payments',
      title: 'Payments',
      type: 'item',
      url: '/payments',
      icon: icons.MoneyCollectOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-tokens',
      title: 'Tokens',
      type: 'item',
      url: '/tokens',
      icon: icons.FontSizeOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-notifications',
      title: 'Notifications',
      type: 'item',
      url: '/notifications',
      icon: icons.AlertOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-meter-readings',
      title: 'Meter Readings',
      type: 'item',
      url: '/meter-readings',
      icon: icons.ReadOutlined,
      breadcrumbs: false
    },
    {
      id: 'util-rates',
      title: 'Rates',
      type: 'item',
      url: '/rates',
      icon: icons.DollarOutlined,
      breadcrumbs: false
    },
    // {
    //   id: 'util-typography',
    //   title: 'Typography',
    //   type: 'item',
    //   url: '/typography',
    //   icon: icons.FontSizeOutlined
    // },
    // {
    //   id: 'util-color',
    //   title: 'Color',
    //   type: 'item',
    //   url: '/color',
    //   icon: icons.BgColorsOutlined
    // },
    // {
    //   id: 'util-shadow',
    //   title: 'Shadow',
    //   type: 'item',
    //   url: '/shadow',
    //   icon: icons.BarcodeOutlined
    // }
  ]
};

export default utilities;
