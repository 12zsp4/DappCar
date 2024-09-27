import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Index from '../pages/Index.js'
import Login from '../pages/Login.js'
import Register from '../pages/Register.js'
import NotFoundPage from '../pages/NotFoundPage.js'
import GoodsListWrapper from '../pages/GoodsList.js'
import GoodsInfoWrapper from '../pages/GoodInfo.js'
import AddProduct from '../pages/AddProduct.js'
import ZhuiSu from '../pages/Zhuisu.js'
import UpdateList from '../pages/updateList.js'
import ModifyScheme from '../pages/updateProduct.js'
import OffSaleList from '../pages/OffShelve.js'
import AddCar from '../pages/BuyInsurance.js'
export default function MyRoute() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/api' element={<Index />}>
                    <Route path="goodsList" element={<GoodsListWrapper />} />
                    <Route path="goodInfo/:id/:address/:price/:imageHash/:title/:schemeId/:schemeInfo/:PayimageHash/:buyKnowledge/:historyimageHash/:productimageHash" element={<GoodsInfoWrapper />} />
                    <Route path="myPicture" element={<Login />} />
                    <Route path="goodsAdd" element={<AddProduct />} />
                    <Route path="updateList" element={<UpdateList />} />
                   <Route path="updateProduct" element={<ModifyScheme />} />
                   <Route path="offSaleProducts" element={<OffSaleList />} />
                    <Route path="zhuisu/:cAddr/:goodId" element={<ZhuiSu />} />
                    <Route path="buyInsurance" element={<AddCar />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
             
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}

