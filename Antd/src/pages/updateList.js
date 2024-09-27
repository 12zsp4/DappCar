import React, { useState, useEffect } from 'react';
import { Card, List, Spin, Image, Input, Button, Pagination, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { web3, companyListContract, companyABI } from "../contract/contractUtils";
const { Meta } = Card;

const UpdateList = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // 每页显示的数量
  const navigate = useNavigate();

  useEffect(() => {
    getGoodsList2();
  }, []);

  const getGoodsList2 = async () => {
    const newData = [];

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    var companyAddressList = await companyListContract.methods.getCompanyList().call(
      { from: account }
    );

    for (var i = 0; i < companyAddressList.length; i++) {
      var companyContract = await new web3.eth.Contract(companyABI, companyAddressList[i]);

      var userName = await companyContract.methods.userName().call({ from: account });
      var schemeIds = await companyContract.methods.getSchemeIds().call({ from: account });
      var cOwner = await companyContract.methods.owner().call();
      for (var j = 0; j < schemeIds.length; j++) {
        var insuranceInfo = await companyContract.methods.getSchemeInfoById(schemeIds[j]).call({ from: account });
        var companyAddress = companyAddressList[i];
        var insuranceName = insuranceInfo[1];
        
        // 根据商品在售状态决定是否添加到 newData 中
        if (insuranceInfo[5]) {
          newData.push({
            title: userName,
            companyAddress: companyAddress,
            schemeId: schemeIds[j],
            schemeInfo: insuranceInfo[1],
            price: insuranceInfo[4],
            imageHash: insuranceInfo[6],
            PayimageHash: insuranceInfo[7],
            buyKnowledge: insuranceInfo[8],
            historyimageHash: insuranceInfo[9],
            productimageHash: insuranceInfo[10],
            owner: cOwner,
            onSale: insuranceInfo[5], // 商品在售状态
          });
        }
      }
    }

    setData(newData);
  }

  const handleSearch = () => {
    console.log('Search term:', searchTerm);
    if (!searchTerm) {
      setData(null); // 清空数据
      return;
    }

    // 根据搜索关键词过滤数据
    const filteredData = data.filter(item => item.schemeInfo.includes(searchTerm));
    setData(filteredData);
  }

  const handleChangePage = (page) => {
    setCurrentPage(page);
  }

  const handleOffSale = async (schemeId) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      var companyAddressList = await companyListContract.methods.getCompanyList().call(
        { from: account }
      )
      var companyContract = await new web3.eth.Contract(companyABI, companyAddressList[0]);

      await companyContract.methods.setSchemeOffSale(schemeId).send({ from: account });
      message.success('成功下架商品');

      // 从数据中移除已下架的商品
      setData(prevData => prevData.filter(item => item.schemeId !== schemeId));
    } catch (error) {
      message.error('下架商品失败');
      console.error('Error while setting scheme off sale:', error);
    }
  };

  const renderPagination = () => {
    return (
      <Pagination
        current={currentPage}
        total={data.length}
        pageSize={pageSize}
        onChange={handleChangePage}
        style={{ textAlign: 'center', marginTop: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 10px', position: 'relative' }}>
      <Input.Search
        placeholder="输入保险产品名称搜索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={handleSearch}
        style={{ width: 300, margin: '20px' }}
      />
      {data ? (
        <>
          <div style={{ position: 'absolute', top: 0, right: 150, margin: '20px' }}>
            <Button type="primary" style={{ backgroundColor: 'blue', borderColor: 'blue' }} onClick={() => navigate('/api/updateProduct')}>
              修改商品
            </Button>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, margin: '20px' }}>
            <Button type="primary" style={{ backgroundColor: 'red', borderColor: 'red' }} onClick={() => navigate('/api/offSaleProducts')}>
              被下架商品区
            </Button>
          </div>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            renderItem={(item) => (
              <List.Item style={{ marginBottom: 20 }}>
                {item.onSale && (
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
                      title={"保险公司名称：" + item.title}
                      onClick={() => navigate(`/api/goodInfo/${item.schemeId}/${item.companyAddress}`)}
                      description={
                        <div>
                          {"保险产品名称：" + item.schemeInfo}
                          <br />
                          {"保险价格：" + item.price}
                          <br />
                          {"保险录入人员地址：" + item.owner}
                        </div>
                      }
                    />
                    <Button onClick={(e) => { e.stopPropagation(); navigate(`/api/zhuisu/${item.owner}/${item.schemeId}`); }}>产品信息追溯</Button>
                    <Button style={{ marginTop: '10px' }} onClick={(e) => { e.stopPropagation(); handleOffSale(item.schemeId); }}>下架商品</Button>
                  </Card>
                )}
              </List.Item>
            )}
          />
          {renderPagination()}
        </>
      ) : (
        <Spin size="large" />
      )}
    </div>
  );
}

export default UpdateList;
