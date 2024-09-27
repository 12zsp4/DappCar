import React, { useState,useEffect } from 'react';
import { Card, List, Modal, Button } from 'antd';
import {  useNavigate} from 'react-router-dom';
import { web3, _AccidentRecordList, _BuyRecordList, companyListContract, companyABI } from "../contract/contractUtils";


const { Meta } = Card;


const GoodsListWrapper = () => {
//  const location = useLocation();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
 //const { data } = location.state || [];
useEffect( () => {
    console.log("----------effect-----------")
     getGoodsList2();
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
}, []); // 空数组[]表示仅在组件挂载时执行


  const getGoodsList2 = async () => {
    const data = [];

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // 处理登录逻辑
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    //获取公司地址
    //获取公司合约
    //遍历公司合约，获取对应保险信息
    var companyAddressList = await companyListContract.methods.getCompanyList().call(
      { from: account }
    )
  
    for (var i = 0; i < companyAddressList.length; i++) {
      var companyContract = await new web3.eth.Contract(companyABI, companyAddressList[i]);
  
      var userName = await companyContract.methods.userName().call({ from: account })
      var schemeIds = await companyContract.methods.getSchemeIds().call({ from: account })
  
      for (var j = 0; j < schemeIds.length; j++) {
        var insuranceInfo = await companyContract.methods.getSchemeInfoById(schemeIds[j]).call({ from: account })
        var companyAddress =  companyAddressList[i] ;
        var insuranceName =  insuranceInfo[1] ;
        data.push({
          title: userName,
          companyAddress: companyAddress,
          schemeId: schemeIds[j],
          schemeInfo: insuranceInfo[1],
          price:insuranceInfo[4],
          imageHash:insuranceInfo[6]
        })
      }
    }
  
    setData(data);//[{},{},{}]
  }
  
  //getGoodsList2()
//getGoodsList(setData)

//console.log("------------------------")

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showModalItem, setShowModalItem] = useState('');
  const showModal = (item) => {
    setShowModalItem(item)
    setOpen(true);
  };
  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };
  const handleCancel = () => {
    setOpen(false);
  };
  /*if (!data) {
    return <div>Loading...</div>;
  }*/
  return (
    <List
      grid={{
        gutter: 16,
        //column: 4,
      }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <Card
            hoverable
            style={{
              width: 240,
            }}
            cover={<img alt="example" src={"https://gateway.pinata.cloud/ipfs/"+item.imageHash} />}
            onClick={
              () => showModal(item)
              
          
            
            } // 添加点击事件  
          >
            <Meta title={"保险公司名称：" + item.title} description={<div>
              {"保险产品名称：" + item.schemeInfo}
              <br />
              {"保险价格：" + item.price}
            </div>} />

          </Card>
          <Modal
            open={open}
            title="提交购买保险"
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Return
              </Button>,
              <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                Submit
              </Button>,
              <Button
                key="link"
                href="https://google.com"
                type="primary"
                loading={loading}
                onClick={handleOk}
              >
                Search on Google
              </Button>,
            ]}
          >
            <p>{"保险价格:"+showModalItem.price}</p>
            <p>{"保险名称:"+showModalItem.schemeInfo}</p>
            <p>{"保险公司名称：" + showModalItem.title}</p>
          </Modal>
        </List.Item>
      )}
    />)
}
export default GoodsListWrapper;