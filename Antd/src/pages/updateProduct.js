import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { web3, companyListContract, companyABI } from '../contract/contractUtils';

const ModifyScheme = () => {
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkMWE4MjNhZC05OTliLTQ3ZjItYTJjMC02ZWM4MDE2NjAyOTYiLCJlbWFpbCI6IjI0ODYwNDk0MjRAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNmZDI3MTgzYjIxMzMwMTM5MGVlIiwic2NvcGVkS2V5U2VjcmV0IjoiNDg5YzNmNDVjZjdmMjE0NDk1NjI4Y2ZlMTBhODQ0NWVhZGEyNzUzODBjNWQ4NjM0ODEwNTZjMzI3ZDE4NTk0NyIsImlhdCI6MTcxNzMxMTEwMX0.bpDlVACLWVuIjMKYeVL7bt_QqCc86JacsjBCDyjGg1Y";

    // 使用useState来管理表单和保险方案信息状态
    const [form] = Form.useForm(); // 获取表单实例
    const [schemeData, setSchemeData] = useState(null); // 状态：保险方案信息
    const [schemeId, setSchemeId] = useState(""); // 状态：保险方案ID

    // 根据公司地址获取合约实例的函数
    const getCompanyContractInstance = (companyAddress) => {
        return new web3.eth.Contract(companyABI, companyAddress);
    };

    // 错误处理函数
    const handleErrors = (error, errorMessage) => {
        console.error(errorMessage, error);
        message.error(errorMessage);
    };

    // 根据保险方案ID获取保险信息的函数
    const fetchSchemeInfoById = async () => {
        try {
            // 请求用户授权使用以太坊账户
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts(); // 获取当前以太坊账户
            const account = accounts[0]; // 取第一个账户
            const companyAddress = await companyListContract.methods.getCompanyList().call(); // 获取公司列表
            const firstCompanyAddress = companyAddress[0]; // 取第一个公司地址
            const companyContract = getCompanyContractInstance(firstCompanyAddress); // 获取公司合约实例

            // 通过合约方法获取指定ID的保险方案信息
            const schemeInfo = await companyContract.methods.getSchemeInfoById(schemeId).call({ from: account });

            // 更新表单字段的值和保险信息状态
            form.setFieldsValue({
                schemeName: schemeInfo[1],
                lastTime: schemeInfo[2],
                price: schemeInfo[3],
                payOut: schemeInfo[4],
            });
            setSchemeData(schemeInfo); // 更新保险方案信息状态
        } catch (error) {
            handleErrors(error, '获取保险信息失败，请重试');
        }
    };

    // 表单提交处理函数
    const onFinish = async (values) => {
        try {
            const accounts = await web3.eth.getAccounts(); // 获取当前以太坊账户
            const account = accounts[0]; // 取第一个账户
            const companyAddress = await companyListContract.methods.getCompanyList().call(); // 获取公司列表
            const firstCompanyAddress = companyAddress[0]; // 取第一个公司地址
            const companyContract = getCompanyContractInstance(firstCompanyAddress); // 获取公司合约实例

            // 构建历史图片哈希数组
            const historyimageHash = [];
            values.imageHash3.fileList.forEach(file => {
                historyimageHash.push(file.response);
            });
            // 构建产品图片哈希数组
            const productimageHash = [];
            values.imageHash4.fileList.forEach(file => {
                productimageHash.push(file.response);
            });

            // 修改保险方案
            await companyContract.methods.modifyScheme(
                schemeData[0], // 使用 schemeData 中的保险方案 ID
                values.schemeName,
                values.lastTime,
                values.price,
                values.payOut,
                values.imageHash0.file.response,
                values.imageHash1.file.response,
                values.imageHash2.file.response,
                historyimageHash,
                productimageHash
            ).send({ from: account, gas: 5000000 }).on('receipt', async function (receipt) {
                message.success('保险方案修改成功');
                console.log("----------------------------", receipt)
                if (receipt.type == 2) {
                    // 成功修改保险方案后执行信息追溯
                    await executeTraceability(values, receipt.transactionHash, account, receipt);
                    //message.success('保险方案修改成功');
                   
                }
            });
        } catch (error) {
            console.error("修改保险方案错误: ", error);
            message.error('修改失败，请重试');
        }
    };

    // 信息追溯
    const executeTraceability = async (values, transactionHash, account, receipt) => {
        try {
            // 获取交易信息
            const tran = await web3.eth.getTransaction(transactionHash); // 获取交易
            const nonce = tran.nonce.toString(); // 获取交易的 nonce
            // const receipt = await web3.eth.getTransactionReceipt(transactionHash); // 获取交易收据
            const data = {
                goodId: receipt.events.ModifySchemeSucc.returnValues.schemeId.toString(), // 提取事件参数 goodId
                tHash: receipt.transactionHash.toString(), // 提取交易哈希
                blocknumber: receipt.blockNumber.toString(), // 提取区块号
                actionType: 2, // 设置交易类型为修改保险方案
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
                message.success('追溯信息成功');
            } else {
                message.error('追溯信息失败');
            }
        } catch (error) {
            console.error("添加追溯信息错误: ", error);
            message.error('追溯信息失败');
        }
    };

    // 文件上传前的校验函数
    const beforeUpload = (file) => {
        const isJPGorPNG = file.type === 'image/jpg' || file.type === 'image/png';
        if (!isJPGorPNG) {
            message.error('您只能上传 JPG 或 PNG 文件！');
            return false;
        }
        return true;
    };

    // 自定义文件上传请求函数
    const customRequest = async (options) => {
        try {
            const formData = new FormData();
            formData.append("file", options.file);

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
            options.onSuccess(ipfsHash);
        } catch (error) {
            options.onError(error);
        }
    };

    // 文件预览函数
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

    // 文件列表变化处理函数
    const onChange = (index, { fileList: newFileList }) => {
        setFileList((prevFileList) => {
            const updatedFileList = [...prevFileList];
            updatedFileList[index] = newFileList;
            return updatedFileList;
        });
    };

    // 初始化表单字段的值
    const initialValues = schemeData ? {
        schemeName: schemeData[1] || '',
        lastTime: schemeData[2] || '',
        price: schemeData[3] || '',
        payOut: schemeData[4] || '',
        imageHash0: [{ response: schemeData[7] || '' }],
        imageHash1: [{ response: schemeData[8] || '' }],
        imageHash2: [{ response: schemeData[9] || '' }],
        imageHash3: (schemeData[10] || []).map(hash => ({ response: hash })),
        imageHash4: (schemeData[11] || []).map(hash => ({ response: hash })),
    } : {};

    // 文件列表状态管理
    const [fileList, setFileList] = useState(Array(5).fill([]));

    return (
        <div>
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={initialValues}
            >
                {/* 保险方案ID输入框 */}
                <Form.Item
                    label="保险方案ID"
                    name="schemeId"
                >
                    <Input
                        type="number"
                        value={schemeId}
                        onChange={(e) => setSchemeId(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" onClick={fetchSchemeInfoById}>获取保险信息</Button>
                </Form.Item>

                {/* 其他表单项 */}
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

                {/* 上传图片 */}
                {['商品图片', '赔款条例', '购买须知', '历史赔付案例', '产品详情'].map((label, index) => (
                    <Form.Item
                        key={index}
                        label={label}
                        name={`imageHash${index}`}
                        rules={[{ required: true, message: `请上传${label}图片！` }]}
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
                                    <Button icon={<PlusOutlined />}>上传图片</Button>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                ))}

                {/* 提交按钮 */}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ModifyScheme;
