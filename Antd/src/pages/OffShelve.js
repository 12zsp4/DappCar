import React, { useState, useEffect } from 'react';
import { Card, List, Spin, Image, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { web3, companyListContract, companyABI } from "../contract/contractUtils";
const { Meta } = Card;

const OffSaleList = () => {
  const [offSaleData, setOffSaleData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getOffSaleGoods();
  }, []);

  const getOffSaleGoods = async () => {
    const newData = [];

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    var companyAddressList = await companyListContract.methods.getCompanyList().call(
      { from: account }
    );

    for (var i = 0; i < companyAddressList.length; i++) {
      var companyContract = await new web3.eth.Contract(companyABI, companyAddressList[i]);

      var schemeIds = await companyContract.methods.getSchemeIds().call({ from: account });
      var cOwner = await companyContract.methods.owner().call();
      for (var j = 0; j < schemeIds.length; j++) {
        var insuranceInfo = await companyContract.methods.getSchemeInfoById(schemeIds[j]).call({ from: account });

        // 只添加已下架的商品到 newData 中
        if (!insuranceInfo[5]) { // insuranceInfo[5] 是商品在售状态，false 表示已下架
          newData.push({
            companyAddress: companyAddressList[i],
            schemeId: schemeIds[j],
            schemeInfo: insuranceInfo[1],
            price: insuranceInfo[4],
            imageHash: insuranceInfo[6],
            PayimageHash: insuranceInfo[7],
            buyKnowledge: insuranceInfo[8],
            historyimageHash: insuranceInfo[9],
            productimageHash: insuranceInfo[10],
            owner: cOwner,
          });
        }
      }
    }

    setOffSaleData(newData);
  }

  const handleReList = async (schemeId) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      var companyAddressList = await companyListContract.methods.getCompanyList().call(
        { from: account }
      )
      var companyContract = await new web3.eth.Contract(companyABI, companyAddressList[0]);

      await companyContract.methods.setOnSale(schemeId, true).send({ from: account });
      message.success('成功重新上架商品');

      // 从数据中移除重新上架的商品
      setOffSaleData(prevData => prevData.filter(item => item.schemeId !== schemeId));
    } catch (error) {
      message.error('重新上架商品失败');
      console.error('Error while setting scheme on sale:', error);
    }
  };

  return (
    <div style={{ padding: '0 10px' }}>
      <h2 style={{ marginBottom: '20px' }}>已下架的商品列表</h2>
      {offSaleData ? (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={offSaleData}
          renderItem={(item) => (
            <List.Item style={{ marginBottom: 20 }}>
              <Card
                hoverable
                style={{ width: 400 }}
                cover={<Image
                  src={"https://gateway.pinata.cloud/ipfs/" + item.imageHash}
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '240px',
                  }}
                />}
                onClick={() => navigate(`/api/goodInfo/${item.schemeId}/${item.companyAddress}/${item.price}/${item.imageHash}/${item.title}/${item.schemeId}/${item.schemeInfo}/${item.PayimageHash}/${item.buyKnowledge}/${item.historyimageHash}/${item.productimageHash}`)}
              >
                <Meta
                  title={"保险产品名称：" + item.schemeInfo}
                  description={
                    <div>
                      {"保险价格：" + item.price}
                      <br />
                      {"保险录入人员地址：" + item.owner}
                    </div>
                  }
                />
                <Button onClick={(e) => { e.stopPropagation(); handleReList(item.schemeId); }}>重新上架商品</Button>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Spin size="large" />
      )}
    </div>
  );
}

export default OffSaleList;
