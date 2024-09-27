/* eslint-disable no-undef */ // 告诉 lint 工具忽略对 BigInt 的检查
import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Button, Modal, Input } from 'antd';
import axios from "axios";
import { web3, erc20Contract } from "../contract/contractUtils";

const { Header, Content, Footer, Sider } = Layout;
const { TextArea } = Input;

const Index = () => {
    const navigate = useNavigate();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const [menuData, setMenuData] = useState([]);
    const [ethValue, setEthValue] = useState(0);
    const [erc20Value, setErc20Value] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const userInfo = {
        username: window.localStorage.getItem("username") || "匿名用户",
        account: window.localStorage.getItem("account") || "未知账号",
    };

    const getValueOfEth = async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const valEthInWei = await web3.eth.getBalance(account);
        const valEth = web3.utils.fromWei(valEthInWei, 'ether');
        const formattedEth = parseFloat(valEth).toFixed(2);

        setEthValue(formattedEth);
        const erc20Val = await erc20Contract.methods.balanceOf(account).call();
        // 将 BigInt 类型的数据转换为字符串类型
        setErc20Value(erc20Val.toString()); // 直接显示 ERC 代币余额
    }

    useEffect(() => {
        getValueOfEth();

        axios.get(`http://localhost:3001/menu/${window.localStorage.getItem("roleId")}`, {
            headers: {},
        }).then(function (response) {
            setMenuData(response.data)
        }).catch(function (error) {
            console.error(error);
        });

        return () => {
            console.log("----------return-----------")
        };
    }, []);


    // 兑换代币
    const getSwapTokensForEth = async () => {
        try {
            const receipt = await erc20Contract.methods.swapTokensForEth().send({ from: userInfo.account, value: web3.utils.toWei('10', 'ether'), gas: 5000000 });
            console.log(receipt);
            const erc20Val = await erc20Contract.methods.balanceOf(userInfo.account).call();
            // 将 BigInt 类型的数据转换为字符串类型
            setErc20Value(erc20Val.toString()); // 直接显示 ERC 代币余额

            const valEthInWei = await web3.eth.getBalance(userInfo.account);
            const valEth = web3.utils.fromWei(valEthInWei, 'ether');
            const formattedEth = parseFloat(valEth).toFixed(2);
            setEthValue(formattedEth);
        } catch (err) {
            console.log(err);
            alert(err);
        }
    };
    
    // 回兑代币
    const getSwapEthForTokens = async () => {
        try {
            const receipt = await erc20Contract.methods.transferEtherTo(inputValue).send({ from: userInfo.account, gas: 5000000 });
            console.log(receipt);
            const erc20Val = await erc20Contract.methods.balanceOf(userInfo.account).call();
            // 将 BigInt 类型的数据转换为字符串类型
            setErc20Value(erc20Val.toString()); // 直接显示 ERC 代币余额

            const valEthInWei = await web3.eth.getBalance(userInfo.account);
            const valEth = web3.utils.fromWei(valEthInWei, 'ether');
            const formattedEth = parseFloat(valEth).toFixed(2);
            setEthValue(formattedEth);
        } catch (err) {
            console.log(err);
            alert(err);
        }
    };
    

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        getSwapEthForTokens(); // 这里调用了正确的方法
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <Layout>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ color: '#FFFFFF', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', padding: '10px 20px', lineHeight: '1.2', fontWeight: 'bold' }}>车辆保险管理系统</h1>
                <div style={{ color: '#FFFFFF' }}>
                    用户姓名：{userInfo.username}
                </div>
                <div style={{ color: '#FFFFFF' }}>
                    登录账号：{userInfo.account}
                </div>
                <div style={{ color: '#FFFFFF' }}>
                    <Button type="primary" onClick={() => getSwapTokensForEth()}>兑换代币</Button>
                    <Button type="primary" onClick={showModal}>回兑ETH</Button>
                    <Modal title="输入回兑代币数量" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                        <p>请输入要回兑的代币数量:</p>
                        <TextArea
                            placeholder="输入回兑代币数量"
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </Modal>
                </div>
                <div style={{ color: '#FFFFFF' }}>
                    代币余额：{erc20Value} erc
                </div>
                <div style={{ color: '#FFFFFF' }}>
                    ETH余额:{ethValue}eth
                </div>
            </Header>
            <Content style={{ padding: '0 48px' }}>
                <Layout style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    <Sider style={{ background: colorBgContainer }} width={200}>
                        <Menu mode="inline" style={{ height: '100%' }} items={menuData} onClick={(e) => { navigate(e.key, { replace: true }) }}>
                        </Menu>
                        <Menu>
                            <Menu.Item >
                                <Link to="/api/login">首页</Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content style={{ padding: '0 24px', minHeight: 280 }}>
                        <Outlet></Outlet>
                    </Content>
                </Layout>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
    );
};

export default Index;
