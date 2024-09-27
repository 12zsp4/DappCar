import React, { useState, useEffect } from 'react';
import { Button, Input, message, Select, Modal, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { web3, carOwnerListContract, carOwnerABI, buyRecordListContract, companyListContract, companyABI } from '../contract/contractUtils';

const { Option } = Select;

const AddCar = () => {
  const [carNumber, setCarNumber] = useState('');
  const [carName, setCarName] = useState('');
  const [carAge, setCarAge] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [carOwnerAddresses, setCarOwnerAddresses] = useState([]);
  const [selectedCarOwner, setSelectedCarOwner] = useState('');
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [carId, setCarId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstCompanyAddress, setFirstCompanyAddress] = useState('');
  const [insurancePrice, setInsurancePrice] = useState(100); // 默认保险价格为100

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log('当前账号:', accounts[0]);
        await fetchCarOwnerAddresses();
        await fetchFirstCompanyAddress();
      } catch (error) {
        console.error('获取账号失败:', error);
        console.error('无法获取当前账号，请检查您的Web3连接');
        message.error('无法获取当前账号，请检查您的Web3连接');
      }
    };

    fetchAccount();
  }, []);

  const fetchCarOwnerAddresses = async () => {
    try {
      const carOwnerAddressList = await carOwnerListContract.methods.getCarownerList().call();
      setCarOwnerAddresses(carOwnerAddressList);
      if (carOwnerAddressList.length > 0) {
        setSelectedCarOwner(carOwnerAddressList[0]);
      }
    } catch (error) {
      console.error('获取车主地址列表失败:', error);
      message.error('无法获取车主合约地址列表');
    }
  };

  const fetchFirstCompanyAddress = async () => {
    try {
      const companyAddresses = await companyListContract.methods.getCompanyList().call();
      if (companyAddresses.length > 0) {
        setFirstCompanyAddress(companyAddresses[0]);
        setCompany(companyAddresses[0]);
      }
    } catch (error) {
      console.error('获取公司地址列表失败:', error);
      message.error('无法获取公司合约地址列表');
    }
  };

  const handleAddCarClick = async () => {
    try {
      setLoading(true);

      if (!account) {
        throw new Error('无法获取当前账号，请检查您的Web3连接');
      }

      const firstCarOwnerAddress = carOwnerAddresses[0];
      const carOwnerContract = new web3.eth.Contract(carOwnerABI, firstCarOwnerAddress);
      await carOwnerContract.methods.addCar(carNumber, carName, parseInt(carAge)).send({ from: account });
      message.success('成功添加车辆');
      setCarNumber('');
      setCarName('');
      setCarAge('');

    } catch (error) {
      console.error('添加车辆失败:', error.message);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceButtonClick = () => {
    if (!selectedCarOwner) {
      message.error('请选择车主合约地址');
      return;
    }

    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setInsuranceLoading(true);

      if (!carId || !schemeId || !startTime) {
        throw new Error('请输入车辆ID、方案ID和购买时间');
      }

      if (!account) {
        throw new Error('无法获取当前账号，请检查您的Web3连接');
      }

      const carOwnerListAddr = carOwnerListContract.options.address;
      const carOwner = selectedCarOwner;
      const companyAddr = company;

      await buyRecordListContract.methods.addBuyRecord(
        carOwnerListAddr,
        carOwner,
        parseInt(carId),
        companyAddr,
        parseInt(schemeId),
        startTime.unix(),
        insurancePrice // 使用状态中的保险价格
      ).send({ from: account });

      message.success('成功购买保险');
      setModalVisible(false);
      setCarId('');
      setCompany('');
      setSchemeId('');
      setStartTime(null);

    } catch (error) {
      console.error('购买保险失败:', error.message);
      message.error(error.message);
    } finally {
      setInsuranceLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>若无车辆请先添加车辆再购买保险，如已添加车辆，请点击购买保险</h1>
      <h2>添加车辆</h2>
      <Input
        placeholder="请输入车辆号码"
        value={carNumber}
        onChange={(e) => setCarNumber(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Input
        placeholder="请输入车辆名称"
        value={carName}
        onChange={(e) => setCarName(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Input
        placeholder="请输入车辆年龄"
        value={carAge}
        onChange={(e) => setCarAge(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button
        type="primary"
        onClick={handleAddCarClick}
        style={{ marginRight: '10px' }}
        loading={loading}
        disabled={loading}
      >
        添加车辆
      </Button>
      <Button
        type="primary"
        onClick={handleInsuranceButtonClick}
        style={{ marginRight: '10px' }}
        loading={insuranceLoading}
        disabled={insuranceLoading}
      >
        购买保险
      </Button>
      <Select
        style={{ width: 200, marginBottom: '10px' }}
        defaultValue={carOwnerAddresses[0]}
        onChange={(value) => setSelectedCarOwner(value)}
      >
        {carOwnerAddresses.map((address, index) => (
          <Option key={index} value={address}>{address}</Option>
        ))}
      </Select>

      <Modal
        title="输入车辆ID、公司地址、方案ID和购买时间"
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确认"
        cancelText="取消"
      >
        <Input
          placeholder="请输入车辆ID"
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Select
          placeholder="请选择公司地址"
          value={company || firstCompanyAddress}
          onChange={(value) => setCompany(value)}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          <Option value={firstCompanyAddress}>{firstCompanyAddress}</Option>
        </Select>
        <Input
          placeholder="请输入方案ID"
          value={schemeId}
          onChange={(e) => setSchemeId(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <DatePicker
          showTime
          placeholder="请选择购买时间"
          value={startTime}
          onChange={(date) => setStartTime(date)}
          style={{ marginBottom: '10px', width: '100%' }}
        />
      </Modal>
    </div>
  );
};

export default AddCar;
