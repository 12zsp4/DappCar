import React, { useEffect, useState } from 'react';
import { Divider, Steps, Input, Space,Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { web3, _AccidentRecordList, _BuyRecordList } from "../contract/contractUtils";
import { useParams } from "react-router-dom";
import axios from 'axios';

const ZhuiSu = () => {
    const prarms =  useParams()
    const [current, setCurrent] = useState(0);
    const [nonce, setNonce] = useState("");
    const [tHash, setTHash] = useState("");
    const [items, setItems] = useState([]);
    const onChange = (value) => {
        console.log('onChange:', value);
        setCurrent(value);
    };
   
   
   
    useEffect(()=>{
        web3.eth.getTransactionCount(prarms.cAddr, 'latest')  
        .then((non) => {  
          console.log('Nonce:', non.toString());  
          setNonce(non.toString())
        })  
        .catch((error) => {  
          console.error('Error fetching nonce:', error);  
        });
       var data={
        fromaccount:prarms.cAddr,
        goodId:prarms.goodId,
        serachValue:""
       }
       axios.get(
            `http://localhost:3001/goodsblockInfo/${prarms.goodId}/${prarms.goodId}/""`,
            {
             // params:data,
              headers: {
                'Content-Type': 'application/json',
                //Authorization: `Bearer ${JWT}`,
              },
            }
          ).then( (response)=>{
            var dataItems= []
                for(var i = 0; i< response.data.length;i++){
                   const actionType =  response.data[i].actionType == 1 ? "新增商品" :"修改商品"
                  var d =  {
                        title: `该笔交易nonce: ${response.data[i].cnonce}`,
                        description:`商品录入账号：${response.data[i].fromaccount}；该笔交易Hash: ${response.data[i].tHash} ; 当前交易处理类型：${actionType}`,
                    }
                    dataItems.push(d)
                }
            setItems(dataItems)
               
             
          }
           
          )
         
       }
    ,[])
   

    return (
        <>
            <Space direction="vertical" size="middle">
                <div>信息追溯</div>

                <div>  <Space.Compact size="large">
                    <Input addonBefore={<SearchOutlined />} placeholder="请输入交易hash" onClick={(e)=>{setTHash(e)}} />
                   
                </Space.Compact></div>
                <Button type="primary" onClick={()=>{}}>
                当前总交易笔数：{nonce}
           </Button>
            </Space>
          
            <Divider />
          
            <Steps
                current={current}
                onChange={onChange}
                direction="vertical"
                items={items}
            />
        </>
    );
};
export default ZhuiSu;