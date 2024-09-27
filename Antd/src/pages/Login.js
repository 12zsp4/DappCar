import React from 'react';
import { LockOutlined, UserOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import './login.css';

import { web3, carOwnerListContract, companyListContract, policerListContract, _AccidentRecordList, _BuyRecordList } from "../contract/contractUtils";

const { Option } = Select;

const Login = () => {
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    // 根据用户选择的身份类型进行不同的登录逻辑
    let isLogin = false;
    switch (values.roleId) {
      case '1':
        // 车主登录逻辑
        isLogin = await carOwnerListContract.methods.verifyPwd(values.username, values.password).call({ from: account });
        break;
      case '2':
        // 保险公司登录逻辑
        // 假设有另一个智能合约方法 verifyInsuranceCompanyPwd 用于验证保险公司登录
        isLogin = await companyListContract.methods.verifyPwd(values.username, values.password).call({ from: account });
        break;

      // 交警的登录逻辑
      case '3':
        isLogin = await policerListContract.methods.verifyPwd(values.username, values.password).call({ from: account });
        break;
      default:
        console.error('Invalid identity type');
    }

    if (isLogin) {
      window.localStorage.setItem("roleId", values.roleId);
      window.localStorage.setItem("account", account);
      window.localStorage.setItem("username", values.username);
      window.location.href = "/api";

    } else {
      window.location.href = "/";
    }
  };
  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
        roleId: '1', // 默认选择车主身份
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="roleId"
        rules={[
          {
            required: true,
            message: 'Please select your identity type!',
          },
        ]}
      >
       <Select  placeholder="Select your identity type">
         <Option value="1">Car Owner</Option>
         <Option value="2">Insurance Company</Option>
         <Option value="3">Policer</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: 'Please input your Username!',
          },
        ]}
      >
       <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
      >
       <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
         <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <a className="login-form-forgot" href="">
          Forgot password
        </a>
      </Form.Item>
      <Form.Item>
       <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        Or <a href="/register">register now!</a>
      </Form.Item>
    </Form>
  );
};

export default Login;