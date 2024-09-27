import React, { useState } from 'react';
import { Upload, Button, message, Form, Input, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { web3, companyListContract, companyABI } from '../contract/contractUtils';

const AddProduct = () => {
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkMWE4MjNhZC05OTliLTQ3ZjItYTJjMC02ZWM4MDE2NjAyOTYiLCJlbWFpbCI6IjI0ODYwNDk0MjRAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNmZDI3MTgzYjIxMzMwMTM5MGVlIiwic2NvcGVkS2V5U2VjcmV0IjoiNDg5YzNmNDVjZjdmMjE0NDk1NjI4Y2ZlMTBhODQ0NWVhZGEyNzUzODBjNWQ4NjM0ODEwNTZjMzI3ZDE4NTk0NyIsImlhdCI6MTcxNzMxMTEwMX0.bpDlVACLWVuIjMKYeVL7bt_QqCc86JacsjBCDyjGg1Y"; // 请确保这是有效的 JWT  

    const [form] = Form.useForm();
    const [isValid, setIsValid] = useState(false);
    const [isOnSale, setIsOnSale] = useState(false);

    const getCompanyContractInstance = (companyAddress) => {
        return new web3.eth.Contract(companyABI, companyAddress);
    };

    const onFinish = async (values) => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const companyAddress = await companyListContract.methods.getCompanyList().call();
        const firstCompanyAddress = companyAddress[0];
        const companyContract = getCompanyContractInstance(firstCompanyAddress);
        const historyimageHash = [];
        values.imageHash3.fileList.forEach(file => {
            historyimageHash.push(file.response)
        });
        const productimageHash = [];
        values.imageHash4.fileList.forEach(file => {
            productimageHash.push(file.response)
        });

        try {
            companyContract.methods.addScheme(
                values.schemeName,
                values.lastTime,
                values.price,
                values.payOut,
                values.imageHash0.file.response,
                values.imageHash1.file.response,
                values.imageHash2.file.response,
                historyimageHash,
                productimageHash,
                isValid,
                isOnSale
            ).send({ from: account, gas: 5000000 }).on('receipt', async function (receipt) {
                console.log("receipt:=================================================== ", receipt);
                if (receipt.status == 1) {
                    await executeTraceability(values, receipt.transactionHash, account, receipt);
                    message.success('保险方案添加成功');
                }
            });
        } catch (error) {
            console.error("Error adding scheme: ", error);
            message.error('添加失败，请重试');
        }
    };

    // 信息追溯
    const executeTraceability = async (values, transactionHash, account, receipt) => {
        try {
            // 获取交易信息
            const tran = await web3.eth.getTransaction(transactionHash);
            const nonce = tran.nonce.toString(); // 获取交易的 nonce
            // const receipt = await web3.eth.getTransactionReceipt(transactionHash); // 获取交易收据
            const data = {
                goodId: receipt.events.AddSchemeSucc.returnValues.schemeId.toString(), // 提取事件参数 goodId
                tHash: receipt.transactionHash.toString(), // 提取交易哈希
                blocknumber: receipt.blockNumber.toString(), // 提取区块号
                actionType: 1, // 设置交易类型为新增商品
                fromaccount: account.toString(), // 设置源账户
                toaccount: receipt.to.toString(), // 设置目标账户
                cnonce: nonce, // 设置交易随机数
            };

            // 发送 POST 请求将交易信息写入数据库
            const response = await axios.post(
                "http://localhost:3001/goodsblockInfo",
                data,
                {
                    headers: {
                        'Content-Type': 'application/json', // 设置请求头的 Content-Type
                    },
                }
            );

            if (response.data.status === 200) {
                message.success('追溯信息添加成功');
            } else {
                message.error('追溯信息添加失败');
            }
        } catch (error) {
            console.error("Error adding traceability information: ", error);
            message.error('追溯信息添加失败');
        }
    };

    const beforeUpload = (file) => {
        const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJPGorPNG) {
            message.error('You can only upload JPG or PNG file!');
            return false;
        }
        return true;
    };

    const handleUpload = async ({ onSuccess, onError, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${JWT}`,
                    },
                }
            );

            const ipfsHash = response.data.IpfsHash;

            onSuccess(ipfsHash);// 通过 onSuccess 回调函数传递 IPFS 哈希
        } catch (error) {
            onError(error);
        }
    };

    const customRequest = async (options) => {
        handleUpload(options);
    };

    const onPreview = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };

    const onChange = (index, { fileList: newFileList }) => {
        setFileList((prevFileList) => {
            const updatedFileList = [...prevFileList];
            updatedFileList[index] = newFileList;
            return updatedFileList;
        });
    };

    const initialValues = {
        schemeName: "",
        lastTime: "",
        price: "",
        payOut: "",
        imageHash: "",
        PayimageHash: "",
        buyKnowledge: "",
        historyimageHash: "",
        productimageHash: ""
    };

    const [fileList, setFileList] = useState(Array(5).fill([]));

    return (
        <div>
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={initialValues}
            >
                <Form.Item
                    name="schemeName"
                    label="保险方案名称"
                    rules={[{ required: true, message: '请输入保险方案名称!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="lastTime"
                    label="截止时间"
                    rules={[{ required: true, message: '请选择截止时间!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="价格"
                    rules={[{ required: true, message: '请输入价格!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    name="payOut"
                    label="赔付价格"
                    rules={[{ required: true, message: '请输入赔付价格!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    label="商品是否生效"
                    name="isValid"
                    valuePropName="checked"
                >
                    <Switch onChange={setIsValid} />
                </Form.Item>

                <Form.Item
                    label="商品是否在售"
                    name="isOnSale"
                    valuePropName="checked"
                >
                    <Switch onChange={setIsOnSale} />
                </Form.Item>

                {/* Upload components for images */}
                {['商品图片', '赔款条例', '购买须知', '历史赔付案例', '产品详情'].map((label, index) => (
                    <Form.Item
                        key={index}
                        label={label}
                        name={`imageHash${index}`}
                        rules={[{ required: true, message: `Please upload ${label} image!` }]}
                    >
                        <Upload
                            customRequest={customRequest}
                            beforeUpload={beforeUpload}
                            listType="picture-card"
                            fileList={fileList[index]}
                            onPreview={onPreview}
                            onChange={(info) => onChange(index, info)}
                        >
                            {fileList[index].length < 5 && (
                                <div>
                                    <Button icon={<PlusOutlined />}>
                                        上传图片
                                    </Button>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                ))}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddProduct;
