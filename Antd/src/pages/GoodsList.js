import React, { useState, useEffect } from 'react';
import { Card, List, Spin, Image, Input, Button, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { web3, companyListContract, companyABI } from "../contract/contractUtils";
const { Meta } = Card;

const GoodsListWrapper = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // 每页显示的数量
  const navigate = useNavigate();

  useEffect(() => {
    getGoodsList();
  }, []);

  const getGoodsList = async () => {
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

        // 只添加在售状态为 true 的商品到 newData 中
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
    <div style={{ padding: '0 10px' }}>
      <Input.Search
        placeholder="输入保险产品名称搜索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={handleSearch}
        style={{ width: 300, margin: '20px' }}
      />
      {data ? (
        <>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
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
                  onClick={() => {
                    console.log(item)
                    navigate(`/api/goodInfo/${item.schemeId}/${item.companyAddress}/${item.price}/${item.imageHash}/${item.title}/${item.schemeId}
                    /${item.schemeInfo}/${item.PayimageHash}/${item.buyKnowledge}/${item.historyimageHash}/${item.productimageHash}`)
                  }}
                >
                  <Meta title={"保险公司名称：" + item.title} onClick={
                    () => {
                      console.log(item)
                      navigate(`/api/goodInfo/${item.schemeId}/${item.companyAddress}`)
                    }
                  } description={<div>
                    {"保险产品名称：" + item.schemeInfo}
                    <br />
                    {"保险价格：" + item.price}
                    <br />
                    {"保险录入人员地址：" + item.owner}
                  </div>} />
                  <Button onClick={(e) => {
                    e.stopPropagation(); // 阻止点击事件传播以防止卡片点击事件
                    navigate(`/api/zhuisu/${item.owner}/${item.schemeId}`)
                  }}>产品信息追溯</Button>
                </Card>
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

export default GoodsListWrapper;
