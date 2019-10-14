var express = require('express');
var socket = require('socket.io');
var sqlite = require('sqlite')

// App setup
var app = express();
var server = app.listen(340, function () {
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
        if (data.name == null) {
            console.log("name is null!")
            return;
        }

        sqlSaveUsers(data);
        var userInitData = { handle: data.name, id: socket.id };
        personsOnline = personsOnline.filter(x => x.handle != data.name);
        personsOnline.push(userInitData);

        sqlGetUsers(socket);
        sqlGetMessages(data.name, data.recipient, socket);

        console.log(userInitData);
        console.log('User ' + data.name + ' selected >' + data.recipient + '< channel.');
    });

    // setInterval(function () {
    //     io.emit('getFriends', personsOnline);
    // },5000);
    //

    // Handle chat event
    socket.on('chat', function (data) {
        console.log(data);
        // io.sockets.emit('chat', data);
        sqlSendMessages(data, io.sockets);
    });

    socket.on('channel-switch', function (data) {
        if (data.name == null) {
            console.log("name is null!")
            return;
        }

        console.log('User ' + data.name + ' selected >' + data.recipient + '< channel.');

        sqlGetUsers(socket);
        sqlGetMessages(data.name, data.recipient, socket);
    });

    // Handle typing event

    socket.on('typing', function (data) {
        console.log(data.name + ' is typing to ' + data.recipient);
        if (data.recipient == 'All Chat') {
            socket.broadcast.emit('typing', data);
        } else {
            var typingTo = personsOnline.filter(obj => obj.handle == data.recipient);
            var typingToIsOnline = typingTo != null;
            if (typingToIsOnline) {
                typingTo = typingTo[0];
                io.to(typingTo.id).emit('typing', data);
            }

        }
    });

    socket.on('stoptyping', function (data) {
        if (data.recipient == 'All Chat') {
            socket.broadcast.emit('stoptyping', data);
        } else {
            var typingTo = personsOnline.filter(obj => obj.handle == data.recipient);
            var typingToIsOnline = typingTo != null;
            if (typingToIsOnline) {
                typingTo = typingTo[0];
                io.to(typingTo.id).emit('stoptyping', data);
            }
        }
    });


    //var onlineMembers = io.sockets.adapter.rooms['chat room'].length;

    socket.on('disconnect', function () {
        personsOnline.filter(function (x) {
            return x.id !== socket.id;

        });
        io.emit('online', personsOnline.length);
        io.emit('getFriends', personsOnline);
        sqlGetUsers(socket);
    });

});

function NumClientsInRoom(namespace, room) {
    var clients = io.nsps[namespace].adapter.rooms[room];
    return Object.keys(clients).length;
}

async function sqlSendMessages(data, socket) {

    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        await db.run(`INSERT INTO messages(name, msg, recipient) VALUES("${data.handle}", "${data.message}", "${data.recipient}")`, function (err) {
            if (err) {
                return console.log(err.message);
            }
        });

        if (data.recipient == "All Chat") {
            io.emit('chat', data);
        } else {
            var typingTo = personsOnline.filter(obj => obj.handle == data.recipient);
            var typingToIsOnline = typingTo != null;
            if (typingToIsOnline) {
                typingTo = typingTo[0];
                io.to(typingTo.id).emit('chat', data);
            }
        }

    } catch (err) {
        next(err);
    }
}

async function sqlGetMessages(name, recipient, socket) {

    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        if (recipient == 'All Chat') {
            let [messages] = await Promise.all([
                db.all(`SELECT * FROM messages WHERE recipient = '${recipient}'`)
            ]);
            socket.emit('getMessages', messages);
        } else {
            let [messages] = await Promise.all([
                db.all(`SELECT * FROM messages WHERE (recipient = '${recipient}' AND name='${name}') OR (name = '${recipient}' and recipient='${name}' )`)
            ]);
            socket.emit('getMessages', messages);
        }
    } catch (err) {
        next(err);
    }
}


async function sqlSaveUsers(data) {
    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        let [user] = await Promise.all([
            db.all(`SELECT * FROM users WHERE name='${data.name}'`)
        ]);
       
        if (user.length == 0) {
            let insert = await db.run(`INSERT INTO users(name) VALUES("${data.name}")`, function (err) {
                if (err) {
                    return console.log(err.message);
                }
            });

            console.log('New user inserted: ' + data.name);
            console.log(insert);
        }

    } catch (err) {
        next(err);
    }
}

async function sqlGetUsers(socket) {

    try {
        const db = await sqlite.open('./database.sqlite', { Promise });

        let [users] = await Promise.all([
            db.all(`SELECT * FROM users`)
        ]);

        var allUsers = {
            online: personsOnline,
            other: users
        };

        io.emit('getFriends', allUsers);

    } catch (err) {
        next(err);
    }
}
