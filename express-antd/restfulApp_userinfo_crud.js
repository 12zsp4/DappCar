const express = require('express');
const mysql = require('mysql2');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
require('dotenv').config();
const cors = require('cors');

const app = express();
//npm i  --dev  dotenv
const port = process.env.PORT || 3001;

// 解析请求体
app.use(express.urlencoded({ extended: true })); //  用于解析 URL 编码的请求体，这通常是表单提交时使用的格式
app.use(express.json()); // 用于解析JSON格式的请求体,这通常是在 API 请求或 AJAX 请求中使用的
app.use(cors())

// 生成 Swagger 文档配置
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',//OpenAPI 是一个用于描述 API 的规范，
        info: {
            title: 'API Documentation',
            version: '1.0.0',//项目的版本
        },
    },
    apis: ['./restfulApp_userinfo_crud.js'], // 指定包含 API 路由的文件

    basePath: '/',
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));



//连接数据库
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dapp'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('连接失败:', err.stack);
        return;
    }
    console.log('连接成功');
    connection.release();//释放数据库
});
/*
GET：读取（Read）
POST：新建（Create）
PUT：更新（Update）
DELETE：删除（Delete）


POST /zoos 新建一个动物园
GET /zoos 列出所有动物园
GET /zoos/:id 获取某个指定动物园的信息
PUT /zoos  更新某个指定动物园的全部信息
DELETE /zoos/:id 删除某个动物园
*/




// 示例 API 路由
//https://apifox.com/apiskills/how-to-use-swagger-create-nodejs-api/
//http://localhost:3000/api-docs
/**
     * @openapi
     * '/user':
     *  post:
     *     tags:
     *     - User add Controller
     *     summary: 新增用户
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - password
     *            properties:
     *              username:
     *                type: string
     *                default: johndoe
     *              password:
     *                type: string
     *                default: johnDoe20!@
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      500:
     *        description: Server Error
     */

//处理/user的POST请求
app.post('/user', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const results = await connection.query('insert into userinfo(username,password) value(?,?)', [req.body.username, req.body.password])
    console.log(results);
    if (results[0].affectedRows == 1) {
        res.status(201).json({ status: 201, message: 'user created' })
    } else {
        res.status(409).json({ status: 409, message: 'user already exist' })
    }
    connection.release();
});



/**
   * @openapi
   * '/user':
   *  get:
   *     tags:
   *     - User query all Controller
   *     summary: 获取所有用户信息
   *     responses:
   *      200:
   *        description: Fetched Successfully
   *      400:
   *        description: Bad Request
   *      404:
   *        description: Not Found
   *      500:
   *        description: Server Error
   */
app.get('/user', async (req, res) => {
    const connection = await pool.promise().getConnection();
    //这行代码执行一个SQL查询语句，选择userinfo表中的所有记录。
    const results = await connection.query('SELECT * FROM userinfo')
    res.json(results);
});




/** GET Methods *//**
   * @openapi
   * '/user/{id}':
   *  get:
   *     tags:
   *     - User Controller
   *     summary: 通过id获取用户
   *     parameters:
   *      - name: id
   *        in: path
   *        description: 
   *        required: true
   *     responses:
   *      200:
   *        description: Fetched Successfully
   *      400:
   *        description: Bad Request
   *      404:
   *        description: Not Found
   *      500:
   *        description: Server Error
   */

//获取特定ID的用户信息
app.get('/user/:id', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const results = await connection.query('SELECT * FROM userinfo where userid=?', [req.params.id])
    res.json(results);


});


/**
     * @openapi
     * '/user':
     *  put:
     *     tags:
     *     - User Controller
     *     summary: Modify a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - id
     *            properties:
     *              id:
     *                type: string
     *                default: ''
     *              username:
     *                type: string
     *                default: ''
     *              password:
     *                type: string
     *                default: ''
     *     responses:
     *      200:
     *        description: Modified
     *      400:
     *        description: Bad Request
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */

//更新用户信息
app.put('/user', async (req, res) => {

    const connection = await pool.promise().getConnection();
    const results = await connection.query('update userinfo set username=?,password=? where userid=?', [req.body.username, req.body.password, req.body.id])
    res.json(results);
});



//删除用户信息，根据ID删除
/**
     * @openapi
     * '/user/{id}':
     *  delete:
     *     tags:
     *     - User Controller
     *     summary: Delete user by Id
     *     parameters:
     *      - name: id
     *        in: path
     *        description: The unique Id of the user
     *        required: true
     *     responses:
     *      200:
     *        description: Removed
     *      400:
     *        description: Bad request
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     *
     */
app.delete('/user/:id', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const results = await connection.query('delete from  userinfo  where userid=?', [req.params.id])
    res.json(results);
});


//根据角色ID获取菜单
/** GET Methods *//**
   * @openapi
   * '/menu/{roleId}':
   *  get:
   *     tags:
   *     - User menu Controller
   *     summary: 通过id获取用户菜单
   *     parameters:
   *      - name: roleId
   *        in: path
   *        description: 
   *        required: true
   *     responses:
   *      200:
   *        description: Fetched Successfully
   *      400:
   *        description: Bad Request
   *      404:
   *        description: Not Found
   *      500:
   *        description: Server Error
   */
app.get('/menu/:roleId', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const sql = "select   b.menu_pids  as parentId,b.url as key_url , b.icon ,b.id  ,b.name as label from sys_role_menu  a  left join sys_menu  b on  a.menu_id =b.id where a.role_id = ?"
    const resultValue = await connection.query(sql, [req.params.roleId])
    var results = resultValue[0];
    const data = [];
    //放一级菜单
    for (var i = 0; i < results.length; i++) {
        if (results[i].parentId == 0) {
            data.push({
                id: results[i].id,
                key: results[i].key_url,
                label: results[i].label,
               // icon: results[i].icon,
                children: []
            })
        }
    }
    //放2级菜单
    for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < results.length; j++) {
                if (data[i].id == results[j].parentId && results[j].parentId != 0) {
                    data[i].children.push({
                        id:results[j].id,
                        key: results[j].key_url,
                        label: results[j].label,
                        //icon: results[j].icon,
                    })
                }
            }
    }
    console.log(data)
    res.json(data);
});



//插入追溯数据
app.post('/goodsblockInfo', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const results = await connection.query('insert into goodsblockInfo(goodId,tHash,blocknumber,actionType,fromaccount,toaccount,cnonce) value(?,?,?,?,?,?,?)', [ req.body.goodId,req.body.tHash,req.body.blocknumber,req.body.actionType,req.body.fromaccount,req.body.toaccount,req.body.cnonce])
    console.log(results);
    if (results[0].affectedRows == 1) {
        res.status(200).json({ status: 200, message: 'intsert success created' })
    } else {
        res.status(409).json({ status: 409, message: 'already exist' })
    }
    connection.release();
});



/** GET Methods *//**

   * @openapi
   * '/goodsblockInfo/{serachValue}':
   *  get:
   *     tags:
   *     - User goodsblockInfo Controller
   *     summary: 通过id获取用户菜单
   *     parameters:
   *      - name: serachValue
   *        in: path
   *        description: 商品Id\交易hash\交易账号
   *        required: false
   *     responses:
   *      200:
   *        description: Fetched Successfully
   *      400:
   *        description: Bad Request
   *      404:
   *        description: Not Found
   *      500:
   *        description: Server Error
   */
//查找追溯的数据,根据交易Hash
app.get('/transactionInfo/:tHash', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const sql = "SELECT * FROM goodsblockInfo WHERE tHash = ?";
    const resultValue = await connection.query(sql, [req.params.tHash]);
    const results = resultValue[0];
    console.log(results);
    connection.release();
    res.json(results);
});


app.get('/goodsblockInfo/:goodId/:fromaccount/:serachValue', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const sql = "select * from goodsblockInfo where goodId= ?   or fromaccount= ? or  tHash = ?"
    const resultValue = await connection.query(sql, [req.params.goodId,req.params.fromaccount,req.params.serachValue])
    var results = resultValue[0];
    console.log(results)
    connection.release();
    res.json(results);
});




/**
     * @openapi
     * '/goodsblockInfo':
     *  put:
     *     tags:
     *     - User goodsblockInfo Controller
     *     summary: Modify a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            properties:
     *              id:
     *                type: string
     *                default: ''
     *              goodId:
     *                type: string
     *                default: ''
     *              tHash:
     *                type: string
     *                default: ''
     *              blocknumber:
     *                type: string
     *                default: ''
     *              actionType:
     *                type: string
     *                default: ''
     *              account:
     *                type: string
     *                default: ''
     *              cnonce:
     *                type: string
     *                default: ''
     *              tInfo:
     *                type: string
     *                default: ''
     *     responses:
     *      200:
     *        description: Modified
     *      400:
     *        description: Bad Request
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
//更新追溯的数据，就是更新商品
app.put('/goodsblockInfo', async (req, res) => {
    const connection = await pool.promise().getConnection();
    const results = await connection.query('update userinfo set username=?,password=? where userid=?', [req.body.username, req.body.password, req.body.id])
    connection.release();
    res.json(results);
});




app.listen(port, () => {
    console.log(`Server is running on port  ${port}`);
});
