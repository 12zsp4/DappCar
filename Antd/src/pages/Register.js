import React, { useState } from 'react';
import { LockOutlined, UserOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import './login.css';

// 导入智能合约相关的web3和合约对象
import { web3, carOwnerListContract, companyListContract,policerListContract ,_AccidentRecordList,
  _BuyRecordList } from '../contract/contractUtils';

const { Option } = Select;

const Register = () => {
  const [roleType, setRoleType] = useState('carOwner'); // 默认选择车主角色

  const onFinish = async (values) => {
    // 连接到以太坊网络
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    console.log("Form Values: ", values);

    let registrationSuccess = false;
    switch (roleType) {
      case 'carOwner':
        // 车主注册逻辑
        registrationSuccess = await carOwnerListContract.methods.createCarOwner(
          // 假设 _AccidentRecordList.address 和 _BuyRecordList.address 是需要的参数
           _AccidentRecordList,
           _BuyRecordList,
          values.username,
          values.password,
          values.gender === 'male', // 假设 'male' 返回 true，其他返回 false
          values.phone
        ).send({ from: account });
        break;


      case 'insuranceCompany':
        // 保险公司注册逻辑
        registrationSuccess = await companyListContract.methods.createCompany(
          // 同上，如果需要
           _AccidentRecordList,
           _BuyRecordList,
          values.username,
          values.password,
          values.phone,
          values.companyNo
        ).send({ from: account });
        break;

      case 'policer':
        // 警察注册逻辑
        registrationSuccess = await policerListContract .methods.createPolicer(
          values.username,    
          values.password,
          values.policerNumber,
          values.phone,
          values.gender === 'male' // 假设 'male' 返回 true，其他返回 false
        ).send({ from: account });
        break;

      default:
        console.error('Invalid role type');
    }

    if (registrationSuccess) {
      // 注册成功后的逻辑，例如重定向到登录页面
      window.location.href = "/"; // 假设登录页面的路径是 "/login"
    } else {
      // 注册失败后的逻辑，例如显示错误消息
      console.error('Registration failed');
    }
  };

  return (
    <Form
      name="normal_register"
      className="login-form"
      onFinish={onFinish}
    >
      <Form.Item
        name="roleType"
        rules={[{ required: true, message: 'Please select your role type!' }]}
        hasFeedback
      >
        <Select
          placeholder="Select your role type"
          onChange={(value) => setRoleType(value)}
        >
          <Option value="carOwner">Car Owner</Option>
          <Option value="insuranceCompany">Insurance Company</Option>
          <Option value="policer">policer</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please input your Username!' }]}
        hasFeedback
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
        hasFeedback
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>

      {roleType === 'carOwner' && (
        <>
         <Form.Item
            name="gender"
            rules={[{ required: true, message: 'Please select your Gender!' }]}
            hasFeedback
          >
            <Input placeholder="Gender" />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please input your Phone Number!' }]}
            hasFeedback
          >
            <Input prefix={<MobileOutlined className="site-form-item-icon" />} placeholder="Phone Number" />
          </Form.Item>
         
        </>
      )}

      {roleType === 'insuranceCompany' && (
        <>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please input your Phone Number!' }]}
            hasFeedback
          >
            <Input prefix={<MobileOutlined className="site-form-item-icon" />} placeholder="Phone Number" />
          </Form.Item>
          <Form.Item
            name="companyNo"
            rules={[{ required: true, message: 'Please input your Company Number!' }]}
            hasFeedback
          >
            <Input placeholder="Company Number" />
          </Form.Item>
        </>
      )}

{roleType === 'policer' && (
        <>
         <Form.Item
            name="policerNumber"
            rules={[{ required: true, message: '请输入您的警号' }]}
            hasFeedback
          >
            <Input placeholder="PolicerNumber" />
          </Form.Item>
        
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please input your Phone Number!' }]}
            hasFeedback
          >
            <Input prefix={<MobileOutlined className="site-form-item-icon" />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[{ required: true, message: 'Please select your Gender!' }]}
            hasFeedback
          >
            <Input placeholder="Gender" />
          </Form.Item>
         
        </>
      )}

      <Form.Item>
        <Checkbox>Remember me</Checkbox>
        <a className="login-form-forgot" href="">
          Forgot password
        </a>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Register
        </Button>
        Or <a href="/">login now!</a>
      </Form.Item>
    </Form>
  );
};

export default Register;