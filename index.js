var express = require('express');
var socket = require('socket.io');
var sqlite = require('sqlite')

// App setup
var app = express();
var server = app.listen(340, function(){
    console.log('listening for requests on port 340,');
});

// Static files
app.use(express.static('public'));
var personsOnline = [];
// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    socket.join('chat room');



    socket.on('init', function (data) {
        if(data.name == null){
            console.log("name is null!")
            return;
        }
        personsOnline.push({handle:data.name,id:socket.id});
        io.emit('getFriends', personsOnline);
        sqlGetMessages(data.name, socket);
    });

    setInterval(function () {
        io.emit('getFriends', personsOnline);
    },5000);
    // Handle chat event
    socket.on('chat', function (data) {
        console.log(data);
        // io.sockets.emit('chat', data);
        sqlSendMessages(data, io.sockets);
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

    socket.on('stoptyping', function(data){
        socket.broadcast.emit('stoptyping', data);
    });


        //var onlineMembers = io.sockets.adapter.rooms['chat room'].length;



        socket.on('disconnect', function () {
            personsOnline.filter(function(x) {
                return x.id !== socket.id;

            });
            io.emit('online', personsOnline.length);
            io.emit('getFriends', personsOnline);
        });



});

function NumClientsInRoom(namespace, room) {
    var clients = io.nsps[namespace].adapter.rooms[room];
    return Object.keys(clients).length;
}

async function sqlSendMessages(data, socket){

    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        await db.run(`INSERT INTO messages(name, msg) VALUES("${data.handle}", "${data.message}")`, function(err) {
            if (err) {
                return console.log(err.message);
            }
        });

        socket.emit('chat', data);

    } catch (err) {
        next(err);
    }
}

async function sqlGetMessages(name, socket){

    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        let [messages] = await Promise.all([
            db.all(`SELECT * FROM messages`)
        ]);

        socket.emit('getMessages', messages);

    } catch (err) {
        next(err);
    }
}