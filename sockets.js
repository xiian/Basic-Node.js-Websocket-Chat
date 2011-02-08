// Create a new socket
var sock = new WebSocket('ws://localhost:8082');
console.debug(sock);

// What to do on connection to the server
sock.onopen = function(evt)
{
    console.debug('Connection open', evt);
};

// What to do when a message is received from the server
sock.onmessage = function(evt)
{
    console.debug('On message', evt);
    try {
    	var message = $.parseJSON(evt.data);
    	console.debug(message);
	} catch (Ex) {
	    var message = {sender: 'System', message: evt.data};
	    console.debug(Ex);
	}
    chat.getMsg(message.sender, message.message);
};

// What to do when the connection is closed
sock.onclose = function(evt)
{
    console.debug('on close', evt);
};

// What to do whenever there is an error
sock.onerror = function(evt)
{
    console.debug('on error', evt);
};

var chat = {};
(function(context){
	function getMsg(sender, msg)
	{
	    $('ol').append($('<li><span class="sender">' + sender + '</span> - <span class="msg">' + msg + '</span></li>'));
	}
	function sendMsg()
	{
	    var msg = $('#msg').val();
	    if (msg !== '')
	    {
	        sock.send(msg);
	        getMsg('Me', msg);
	    }
	    $('#msg').val('');
	}
	context.getMsg = getMsg;
	context.sendMsg = sendMsg;
	return context;
})(chat);

$(document).ready(function(){
    $('form').submit(function(){
        chat.sendMsg();
        return false;
    });
    $('#msg').bind('change submit', function(){
        chat.sendMsg();
        return false;
    });
});