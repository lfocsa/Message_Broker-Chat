$(document).ready(function () {

    ep.create(null, {
        type: ep.Type.Prompt,
        title: "Sample Chat",
        content: "Enter your name.",
        onSuccess: function (val) {

            var name = "";
            var recipient = "All Chat";


            if (val != '') {
                name = val;
            } else {
                name = "Unkown";
            }

            $("#eugenia-chat").fadeIn();

            $("#handle").html("Hi " + name);

            // Make connection
            var socket = io.connect('http://localhost:340/');
            //192.168.56.1  acces retea  ipconfig

            // Query DOM
            var message = document.getElementById('message'),
                handle = document.getElementById('handle'),
                btn = document.getElementById('send'),
                friend = document.getElementById('friend'),
                friend_name = document.getElementsByClassName('friend_name'),
                output = document.getElementById('output'),
                feedback = document.getElementById('feedback'),
                userlist = document.getElementById('userlist');

            $("#message").focus();

            $("body").on("keypress", "#message", function (e) {
                if (e.which == 13) {
                    $("#send").eq(0).click();
                }
            });
            socket.emit('init', {
                name: name,
                recipient: recipient
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
                var offline =data.other;

                friend.innerHTML = '';
                data.online.forEach(function(person){
                    offline = offline.filter(x => x.name !== person.handle);
                    if(person.handle != name)
                    friend.innerHTML += '<div  class="friend_name"><span style="color:#080;">&bull;</span> <strong>' + person.handle + ': </strong></div>';
                });
                    offline.forEach(function(person){
                    if(person.name != name)
                        friend.innerHTML += '<div  class="friend_name"><span style="color: #800;">&bull;</span> <strong>' + person.name + ': </strong></div>';
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
                var channelName = $(this).html();
                var user_name = $(this).find('strong').eq(0).html();
                output.innerHTML = '';
                $('h2').html(channelName);
                $('#eugenia-chat').attr('Current',user_name);
                recipient = user_name;
                socket.emit('channel-switch', {
                    name: name,
                    recipient: recipient
                });



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
