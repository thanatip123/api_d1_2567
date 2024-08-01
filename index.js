const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const expressFileupload = require('express-fileupload')
const cors = require('cors')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// Set up Global configuration access
dotenv.config();
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'member'
    }
})
// ส่งแบบ post
app.use(cors())
app.use(bodyParser.json())// ใช้ได้ทุก url

const port = 7000

app.get('/listid',async (req, res) => {
    console.log('email=',  req.query)
    let ids = await knex("users")
       .where({email: req.query.email})
    res.send({
        row: ids[0],
        status: 'ok'
    })
   
   })
app.post('/login', async (req, res) => {
    console.log(req.body)
    //check request
    let email = req.body.email
    let passwd = req.body.passwd
    if (req.body.email == '' || req.body.passwd == ''){
        return res.send({
            massage :"กรุณาตรวจสอบ Email และ Password โปรดใส่ข้อมูล",
            status : 'failed'
        })
    } 
    console.log('Next step 2')
    // check value in database
    let id = await knex('users').where({email : req.body.email , password : req.body.passwd}).select();
    console.log(id.length)
    if (id.length == 0){
        return res.send({
            massage :"กรุณาตรวจสอบ Email และ Password ให้ถูกต้อง",
            status : 'failed_user'            
        })
    }
    console.log('Next step 3 successfully')
    res.send({
        massage :"login successfully",
        statuslogin : 'ok',
        successlogin : id[0],
    })
})
// ส่งแบบ get
app.get('/', (req, res) => {
    //http://localhost:7000?name=XD
    console.log(req.query);
    res.send({
        // status: 'CTC นะจ้ะ',
        data: req.query
    })
})
// ส่งแบบ post
// app.use(cors())
// app.use(bodyParser.json())// ใช้ได้ทุก url
app.post('/insert', async (req, res) => {
    console.log(req.body)
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let status = req.body.status
    let picture = req.body.picture
    try {
        let ids = await knex('users')
            .insert({ username: username, password: password, email: email, status: status, picture: picture })
        res.send({
            status: 'ok',
            id: ids[0],
        })
    } catch (e) {
        res.send({
            ok: 0,
            error: e.message
        })
    }

})
//ลบ
app.get('/delete', async (req, res) => {
    console.log(req.query)
    try {
        let id = req.query.id
        await knex('users').where('id', id).del();
        //or
        // let ids = await knex('users').where({id: req.query.id}).delete();

        res.send({
            ok: 'yes',
            // id: ids
        })
    } catch (e) {
        res.send({
            ok: 0,
            error: e.message
        })
    }

})
// edit
app.post('/update', async (req, res) => {
    console.log(req.body.id)
    // console.log(req.body.username)
    // console.log(req.body.password)
    // console.log(req.body.email)
    let id = req.body.id
    let username = req.body.username
    let passwd = req.body.password
    let email = req.body.email
    let status = req.body.status
    let picture = req.body.picture
    try {
        let ids = await knex('users').where({ id : id }).update({ username: username, password: passwd, email: email, status: status, picture: picture});
        res.send({
            ok: 'yes',
            id: ids
        })
    } catch (e) {
        res.send({
            ok: '0',
            error: e.message
        })
    }
})
// app.post('/update', async (req, res) => {
//     console.log(req.body)
//     try {
//         let ids = await knex('users').where({ id: req.body.id }).update({ username: username, password: password, email: email });
//         res.send({
//             status: 'ok',
//             id: dis,
//         })
//     } catch (error) {
//         res.send({
//             ok: '0',
//             error: error.message
//         })
//     }
// })
app.post('/search', async (req, res) => {
    console.log(req.body)
    let id = req.body.id
    try {
        let row = await knex('users').where({ id: id }).select()
        res.send({
            ok: 'yes',
            rows: row
        })
    } catch (error) {
        res.send({
            ok: '0',
            error: error.message
        })
    }
})
app.get('/list', async (req, res) => {
    try {
        let row = await knex('users')
        res.send({
            ok: 'yes',
            rows: row
        })
    } catch (e) {
        res.send({
            ok: 0,
            error: e.message
        })
    }

})
app.get('/register', (req, res) => {
    res.send('ลงทะเบียน')
})

/////////////////////////////////////////////////////////////
// Main Code Here //
// Generating JWT
app.post("/user/generateToken", (req, res) => {
    // Validate User Here
    // Then generate JWT Token

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: 12,
    }

    const token = jwt.sign(data, jwtSecretKey);
    console.log("token=",token)
    res.send(token);
});

// Verification of JWT
app.get("/user/validateToken", (req, res) => {
    // Tokens are generally passed in header of request
    // Due to security reasons.

    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("Successfully Verified");
        } else {
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});
/////////////////////////////////////////////////////////////

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

