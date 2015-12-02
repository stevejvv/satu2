var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io').listen(http);
var util = require('util');
var path = require('path');
app.set('view engine', 'ejs');
http.listen(3000);


var USERS = [];
var ROOMS = [];


var ROOM_TYPES = [
    { clientNum: 1, clients: { 0: 'satu' } },
    { clientNum: 1, clients: { 0: 'gluco' } },
    { clientNum: 1, clients: { 0: 'astrid' } },
    { clientNum: 2, clients: { 0: 'satu', 1: 'gluco' } },
    { clientNum: 2, clients: { 0: 'satu', 1: 'astrid' } },
    { clientNum: 2, clients: { 0: 'gluco', 1: 'astrid' } },
    { clientNum: 3, clients: { 0: 'satu', 1: 'gluco', 2: 'astrid' } }
];




var ROOMS_TEMPLATE = {
    name: '',
    type: '',
    status: '',
    backend: '',
    satu: '',
    gluco: '',
    astrid: ''
}

var MSG_TEMPLATE = {
    type: 'msgManager',
    data: [
        {
            actionType: '',
            data: []
        }
    ]
}



//SOCKET
io.sockets.on('connection', function (socket) {
    //ON CONNECT
    connectionManager(USERS, socket.id, 'ADD', socket);

    // ON DISCONNECT
    socket.on('disconnect', function () {
        connectionManager(USERS, socket.id, 'DEL', socket);
    });

    // COMM MANAGER
    socket.on('commManager', function (data) {
        commManager(data, socket);
    });
});




app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.get('*', function (req, res) {
    res.sendfile(path.join(__dirname + '/public/views/index.html'));
});





var connectionManager = function (array, socketId, actionType, socket) {
    var msg = '';
    var isPresent = false;
    var index = array.indexOf(socketId);
    if (index !== -1) { isPresent = true; }
    
    // TO ADD AN ID TO THE ARRAY
    
    if (actionType == 'ADD') {
        if (isPresent == false) {
            USERS.push(socketId);
            msg = 'ID added to array';
        }
        else {
            msg = 'ID already in array';
        } 
        
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'initial';
        msg.data[0].data = [socketId];
        msgManager([socketId], msg.type, msg.data[0], socket);
        
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager([socketId], msg.type, msg.data[0], socket);
        
        
        // TO DELETE AN ID FROM THE ARRAY
        
    } else if (actionType == 'DEL') {
        if (isPresent == true) {
            array.splice(index, 1);
            msg = 'ID removed from array';
        }
        else {
            msg = 'ID absent from array';
        }

        for (var i = 0; i < ROOMS.length; i++) {
            if (ROOMS[i].backend == socketId) { ROOMS[i].backend = ""; break; }
            else if (ROOMS[i].satu == socketId) { ROOMS[i].satu = ""; break; }
            else if (ROOMS[i].gluco == socketId) { ROOMS[i].gluco = ""; break; }
            else if (ROOMS[i].astrid == socketId) { ROOMS[i].astrid = ""; break; }
        }
        
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager(['ALL'], msg.type, msg.data[0], socket);



    }
    console.log("connectionManager : " + msg);
    console.log(util.inspect(USERS, false, null));
}




var roomManager = function (data, socket) {
    var actionType = data.actionType;
    
    // TO ADD A ROOM TO THE ARRAY
    
    if (actionType == 'ADD') {

        //CREATE ROOM
        var room_temp = JSON.parse(JSON.stringify(ROOMS_TEMPLATE));

        room_temp.name = data.roomName;
        room_temp.type = data.roomType;
        room_temp.status = 'CREATED';

        for (var i = 0; i < ROOM_TYPES[data.roomType].clientNum; i++) {
            room_temp[ROOM_TYPES[data.roomType].clients[i]] = 'waiting';
        }
        if (room_temp.satu == "") { room_temp.satu = null; }
        if (room_temp.gluco == "") { room_temp.gluco = null; }
        if (room_temp.astrid == "") { room_temp.astrid = null; }
        if (room_temp.satu == "waiting") { room_temp.satu = ""; }
        if (room_temp.gluco == "waiting") { room_temp.gluco = ""; }
        if (room_temp.astrid == "waiting") { room_temp.astrid = ""; }

        ROOMS.push(room_temp);
        room_temp.length = 0; 
        
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager(data.replyIds, msg.type, msg.data[0], socket);
       

        // TO DELETE A ROOM FROM THE ARRAY
    
    } else if (actionType == 'DEL') {
        for (var i = 0; i < ROOMS.length; i++) {
            if (ROOMS[i].name == data.roomName) {
                ROOMS.splice(i, 1);
                break;
            }
        }

        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager(['ALL'], msg.type, msg.data[0], socket);

        console.log('ROOM DELETED');
        
        // TO CONNECT A USER TO A ROOM
        
    } else if (actionType == 'CON') {
        for (var i = 0; i < ROOMS.length; i++) {
            if (ROOMS[i].name == data.roomName) {
                ROOMS[i][data.clientType] = socket.id;
                break;
            }
        }
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager(['ALL'], msg.type, msg.data[0], socket);

        console.log('User connected to room');;

        
        
        
        
        // TO DISCONNECT A USER FROM A ROOM
    
    } else if (actionType == 'DIS') {

        for (var i = 0; i < ROOMS.length; i++) {
            if (ROOMS[i].backend == socket.id) { ROOMS[i].backend = ""; break; }
            else if (ROOMS[i].satu == socket.id) { ROOMS[i].satu = ""; break; }
            else if (ROOMS[i].gluco == socket.id) { ROOMS[i].gluco = ""; break; }
            else if (ROOMS[i].astrid == socket.id) { ROOMS[i].astrid = ""; break; }
        }
        
        //CREATED MSG
        var msg = JSON.parse(JSON.stringify(MSG_TEMPLATE));
        msg.data[0].actionType = 'roomStatus';
        msg.data[0].data = ROOMS;
        msgManager(['ALL'], msg.type, msg.data[0], socket);


    }
    //io.sockets.emit('roomStatus', ROOMS);
    return msg;
}








var commManager = function (data, socket) {


    var managerReturn;
    if (data.manager == 'roomManager') {
        managerReturn = roomManager(data.data[0], socket);
    }

    console.log('managerReturn : ');
    console.log(util.inspect(data, false, null));
}






var msgManager = function (ids, msgType, msg, socket) {

    if (ids[0] == 'ALL') {
        io.sockets.emit(msgType, msg);

    } else if (ids[0] == 'ALL_ROOM') {
        //ROOM NAME
    } else {
        for (var i = 0; i < ids.length; i++) {
            socket.to(ids[i]).emit(msgType, msg);
        }
    }
}