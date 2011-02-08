var sys      = require("sys"),
    http     = require("http"),
    url      = require("url"),
    path     = require("path"),
    fs       = require("fs"),
    events   = require("events"),
    util     = require('utils'),
    ws       = require('websocket-server'),
    spawn    = require('child_process').spawn;
    
// Create the HTTP server
var httpServer = http.createServer(function(req, res){
    var uri = url.parse(req.url).pathname;

	// There are definitely better ways to structure this. I know.
	function load_static_file(uri, response) {
		
	    console.log('load static file ' + uri);
		
		// Load up index.html by default
		if (uri == '/') {
			uri = '/index.html';
		}
		
		// Figure out the full path for this file
		var filename = path.join(process.cwd(), uri);

		path.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}

			fs.readFile(filename, "binary", function(err, file) {
				if(err) {
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}

				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
	}
	
    load_static_file(uri, res);

}).listen(8081);

// Create the websocket server
var ws_server = ws.createServer({
    debug:      true,
    useStorage: true
});

// Just let's us know that it's there.
ws_server.addListener('listening', function(){
    console.log('listening');
});

// What to do whenever someone connects
ws_server.addListener('connection', function(conn){
    console.log('connection');

	// This is what gets sent along via the socket to the user that just connected
    conn.send('Your connection ID is: ' + conn.id);

	// This is what gets broadcast to all the other connections
    conn.broadcast('<' + conn.id + '> connected');
    
    // Add a listener for any other messages
    conn.addListener('message', function(msg){
		// Adds a new listener to any other message events that will send along any messages
        conn.broadcast(JSON.stringify({sender: conn.id, message: msg}));
    });
});

// What to do when a user disconnects
ws_server.addListener('close', function(conn){
    console.log('close');
    ws_server.broadcast('<' + conn.id + '> disconnected');
});

ws_server.listen(8082);