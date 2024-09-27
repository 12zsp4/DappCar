import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs } from "antd";
import { useNavigate } from 'react-router-dom';

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}
    

export default function GoodsInfoWrapper() {
  const { id, address, price, imageHash, title, schemeId, schemeInfo, PayimageHash,buyKnowledge,historyimageHash,productimageHash } = useParams();
  // 将 historyimageHash 解析为数组
  const historyImageHashArray = historyimageHash.split(',');

  // 将 productImageHashArray 解析为数组
  const productImageHashArray = productimageHash.split(',');
  const [isImageVisible, setIsImageVisible] = useState(false);
  const navigate = useNavigate();

  const containerStyle = {
    display: "flex",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "white",
    borderRadius: "5px",
    position: "relative", // 添加这一行
  };

  const imageContainerStyle = {
    flex: "1",
    marginRight: "20px",
  };

  const imageStyle = {
    width: "100%",
    height: "auto",
    objectFit: "contain",
  };

  const additionalImageStyle = {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    marginTop: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    cursor: "pointer",
    display: isImageVisible ? "block" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: "contain",
    zIndex: 999,
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "blue",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const buttonContainerStyle = {
    display: "flex",
    position: "absolute",
    bottom: "20px",
    right: "20px",
  };

  const textContainerStyle = {
    flex: "1",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  };

  const textStyle = {
    fontSize: "16px",
    marginBottom: "10px",
  };

  const handleImageClick = () => {
    setIsImageVisible(!isImageVisible);
  };


  return (
    <div>
      <div style={containerStyle}>
        <div style={imageContainerStyle}>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${imageHash}`}
            alt="商品图片"
            style={imageStyle}
          />
          <img
            src={`https://gateway.pinata.cloud/ipfs/${PayimageHash}`}
            alt="赔款图片"
            style={additionalImageStyle}
            onClick={handleImageClick}
          />
        </div>
        <div style={textContainerStyle}>
          <h1 style={titleStyle}>保险商品详细页面</h1>
          <div>
            <p style={textStyle}>商品名称：{id}</p>
            <p style={textStyle}>方案ID:{schemeId}</p>
            <p style={textStyle}>公司地址：{address}</p>
            <p style={textStyle}>保险产品名称：{schemeInfo}</p>
            <p style={textStyle}>保险价格：{price}</p>
            <p style={textStyle}>保险公司：{title}</p>
          </div>
          <div style={buttonContainerStyle}>
           <button
              style={{ ...buttonStyle, backgroundColor: "#FFA501" }}
              onClick={handleImageClick}
            >
              查看赔款标准
            </button>
           <button
              style={{ ...buttonStyle, backgroundColor: "orange" }} 
              onClick={() => navigate('/api/buyInsurance')}
            >
              购买
            </button>
          </div>
        </div>
      </div>
      <div>
        <Tabs defaultActiveKey="1" onChange={callback} style={{ flex: "1", marginLeft: "20px" }}>
        <TabPane tab="商品详情" key="1">
  
        {
            // 使用 map 函数遍历 productImageHashArray 数组
            productImageHashArray.map((hash, index) => (
              <img
                key={index} // 为每个 img 元素提供唯一的 key
                src={`https://gateway.pinata.cloud/ipfs/${hash}`}
                alt={`商品详情 ${index}`}
                style={imageStyle}
              />
            ))
          }
 
</TabPane>
<TabPane tab="历史赔付案例" key="2">
          {
            // 使用 map 函数遍历 historyimageHash 数组
            historyImageHashArray.map((hash, index) => (
              <img
                key={index} // 为每个 img 元素提供唯一的 key
                src={`https://gateway.pinata.cloud/ipfs/${hash}`}
                alt={`历史赔款图片 ${index}`}
                style={imageStyle}
              />
            ))
          }
        </TabPane>
          <TabPane tab="购买须知" key="3">
          <img
              src={`https://gateway.pinata.cloud/ipfs/${buyKnowledge}`}
              alt="购买须知"
              style={imageStyle}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}