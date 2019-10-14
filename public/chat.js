$(document).ready(function () {

    ep.create(null, {
        type: ep.Type.Prompt,
        title: "Sample Chat",
        content: "Enter your name.",
        onSuccess: function (val) {

            var name = "";
            var recipient = "All Chat";
            $('#eugenia-chat').attr('Current', recipient);

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

            socket.on('reconnect_attempt', () => {
                socket.emit('init', {
                    name: name,
                    recipient: recipient
                });
            });

            // Listen for events
            socket.on('getMessages', function (data) {
                $("#output").html("");
                console.log('getMessages');
                console.log(data);

                if (data != null) {
                    if (data.length > 0) {
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
                var offline = data.other;
                friend.innerHTML = '';

                data.online.forEach(function (person) {
                    if (person.handle != name) {
                        offline = offline.filter(x => x.name !== person.handle);
                        friend.innerHTML += '<div  class="friend_name" data-name="' + person.handle +'"><span class="newMsgs">0</span><b><span style="color:#080;">&bull;</span> <strong>' + person.handle + '</strong></b>: </div>';
                    }
                });

                offline.forEach(function (person) {
                    if (person.name != name) {
                        friend.innerHTML += '<div  class="friend_name" data-name="' + person.handle +'"><span class="newMsgs">0</span><b><span style="color: #800;">&bull;</span> <strong>' + person.name + '</strong></b>: </div>';
                    }
                });
            });

            // Emit events
            btn.addEventListener('click', function () {
                if (message.value != "") {

                    socket.emit('chat', {
                        message: message.value,
                        handle: name,
                        recipient: recipient
                    });

                    output.innerHTML += '<p><strong>' + name + ': </strong>' + message.value + '</p>';
                    var elmnt = document.getElementById("output");
                    var y = elmnt.scrollHeight;
                    $("#chat-window").scrollTop(y);

                    message.value = "";
                }
            });

            $('body').on('click', '.friend_name', function () {
                $(".friend_name").removeClass("active");
                $(this).addClass("active");

                var newMsg = $(this).find(".newMsgs");
                newMsg.removeClass("new");
                newMsg.html(0);

                var channelName = $(this).find('b').eq(0).html();
                var user_name = $(this).find('strong').eq(0).html();
                output.innerHTML = '';
                $('h2').html(user_name);
                $('#eugenia-chat').attr('Current', user_name);
                recipient = user_name;
                socket.emit('channel-switch', {
                    name: name,
                    recipient: recipient
                });
            });

            message.addEventListener('keypress', function () {
                socket.emit('typing', {
                    name: name,
                    recipient: recipient
                });
                setTimeout(function () {
                    socket.emit('stoptyping', {
                        name: name,
                        recipient: recipient
                    });
                }, 1000);
            });

            // Listen for events
            socket.on('chat', function (data) {
                console.log('Chat from ' + data.handle + ' ');
                console.log(data);

                if (data.recipient == name) {
                    var newMsg = $(".friend_name[data-name='" + data.handle + "']").eq(0).find(".newMsgs");
                    newMsg.html(Number(newMsg.html()) + 1);
                    newMsg.addClass("new");
                }

                if ($('#eugenia-chat').attr('Current') == data.handle ||
                    $('#eugenia-chat').attr('Current') == data.recipient ||
                    ($('#eugenia-chat').attr('Current') == 'All Chat' && data.recipient == 'All Chat')) {

                    feedback.innerHTML = '';
                    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';

                    var elmnt = document.getElementById("output");
                    var y = elmnt.scrollHeight;
                    $("#chat-window").scrollTop(y);
                }
            });

            socket.on('online', function (data) {

            });

            socket.on('typing', function (data) {
                if ($('#eugenia-chat').attr('Current') == data.name || ($('#eugenia-chat').attr('Current') == 'All Chat' && data.recipient =='All Chat')) {
                    feedback.innerHTML = '<p><em>' + data.name + ' is typing a message...</em></p>';
                    var elmnt = document.getElementById("output");
                    var y = elmnt.scrollHeight;
                    $("#chat-window").scrollTop(y);
                }
            });

            socket.on('stoptyping', function (data) {
                if ($('#eugenia-chat').attr('Current') == data.name || ($('#eugenia-chat').attr('Current') == 'All Chat' && data.recipient == 'All Chat')) {
                    feedback.innerHTML = '';
                }
            });
        }
    });

});
