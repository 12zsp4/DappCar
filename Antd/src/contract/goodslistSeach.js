import { web3, _AccidentRecordList, _BuyRecordList, companyListContract, companyABI } from "../contract/contractUtils";

const getGoodsList = async (setData) => {
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
          imageHash:insuranceInfo[6],
          PayimageHash:insuranceInfo[7],
          buyKnowledge:insuranceInfo[8],
          historyimageHash:insuranceInfo[9],
          productimageHash:insuranceInfo[10],
        
        })
      }
    }
  
    setData(data) ;
  }
  
  export default getGoodsList
  