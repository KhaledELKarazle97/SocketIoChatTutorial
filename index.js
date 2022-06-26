const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io')
const io = new Server(server);
const bodyParser = require('body-parser')
const redis = require('redis')

const client = redis.createClient();
client.connect();
client.on('error', (err) => {return err});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.get('/',async(req,res)=>{
    await client.multi().set('uname', 'user1').set('pass','123').exec()
    res.sendFile(__dirname+'/template/index.html')
})

app.post('/api/login',async(req, res)=>{
    const [uname,password] = await client.multi().get('uname').get('pass').exec();
    if(req.body.uname == uname && req.body.pass == password){
        res.send({'status':'OK','code':200,'token':'123abc'})
    }    else {res.send({'status':'Unauthorized','code':401})}
})

app.get('/chat', (req, res) => {
   res.sendFile(__dirname+'/template/chat.html')
  });

io.on('connection', (socket) => {
    socket.on('userSent', (msg) => {
        io.emit('userSent', msg);
    });
    socket.on('typing',(msg)=>{
        io.emit('typing',msg)
    })
});


server.listen(3000, () => {console.log('Up and healthy on 3000');});

