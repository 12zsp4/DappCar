import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';



//获取index.html中的div元素，其中id=root
const root = ReactDOM.createRoot(document.getElementById('root'));

//将App组件渲染到div元素中
root.render(
  <React.StrictMode>
    <div>
       <App/>
     
    </div>
  </React.StrictMode>
);


