$(document).ready(function () {

    ep.create(null, {
        type: ep.Type.Prompt,
        title: "Sample Chat",
        content: "Enter your name.",
        onSuccess: function (val) {

            var name = "";
            var recipient = "";


            if (val != '') {
                name = val;
            } else {
                name = "Unkown";
            }

            $("#mario-chat").fadeIn();

            $("#handle").html("You're logged in as " + name);

            // Make connection
            var socket = io.connect('http://localhost:340/');

            // Query DOM
            var message = document.getElementById('message'),
                handle = document.getElementById('handle'),
                btn = document.getElementById('send'),
                friend = document.getElementById('friend'),
                friend_name = document.getElementsByClassName('friend_name'),
                output = document.getElementById('output'),
                feedback = document.getElementById('feedback'),
                online = document.getElementById('online'),
                userlist = document.getElementById('userlist');


            $("#message").focus();

            $("body").on("keypress", "#message", function (e) {
                if (e.which == 13) {
                    $("#send").eq(0).click();
                }
            });
            socket.emit('init', {
                name: name
            });

            // Listen for events
            socket.on('getMessages', function (data) {
                output.innerHTML =="";

                console.log(data);
                if(data != null){
                    if(data.length > 0){
                        data.forEach(msg => {
                            feedback.innerHTML = '';
                            output.innerHTML += '<p><strong>' + msg.name + ': </strong>' + msg.msg + '</p>';

                            var elmnt = document.getElementById("output");
                            var y = elmnt.scrollHeight;
                            $("#chat-window").scrollTop(y);
                        });
                    }
                }
            });
            socket.on('getFriends', function (data) {
                friend.innerHTML = '';
                data.forEach(function(person){
                    friend.innerHTML += '<div  class="friend_name"><strong>' + person.handle + ': </strong></div>';
                });
            });

            // Emit events
            btn.addEventListener('click', function () {
                socket.emit('chat', {
                    message: message.value,
                    handle: name,
                    recipient: recipient

                });
                message.value = "";
            });

            $('body').on('click','.friend_name', function () {

            });

            message.addEventListener('keypress', function () {
                socket.emit('typing', name);
                setTimeout(function () {
                    socket.emit('stoptyping');
                }, 1000);
            });

            // Listen for events
            socket.on('chat', function (data) {
                feedback.innerHTML = '';
                output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';

                var elmnt = document.getElementById("output");
                var y = elmnt.scrollHeight;
                $("#chat-window").scrollTop(y);
            });

            socket.on('online', function (data) {
                online.innerHTML = '';
                online.innerHTML += '<strong>' + data + '</strong>';
            });

            socket.on('typing', function (data) {
                feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';

                var elmnt = document.getElementById("output");
                var y = elmnt.scrollHeight;
                $("#chat-window").scrollTop(y);
            });

            socket.on('stoptyping', function (data) {
                feedback.innerHTML = '';
            });
        }
    });

});
