var refresh = document.getElementById('refresh');
var connections = document.getElementById('connections');
var connect = document.getElementById('connect');
var display = document.getElementById('display');

var loadConnections = function() {
	chrome.serial.getDevices(function(ports) {
		connections.innerHTML = "";
		for(var i = 0; i < ports.length; i++) {
			var connection = document.createElement("option");
			connection.text = ports[i].path;
			connections.add(connection);
		}
	});
}

var openConnection = function(connectionInfo) {
	if(chrome.runtime.lastError) {
		console.log("connection failed: " + chrome.runtime.lastError.message);
	} else {
		chrome.serial.flush(connectionInfo.connectionId, function() {
			console.log("connection with " + connectionInfo.name + " established.");
		});
	}
}

function convertArrayBufferToString(buf) {
	var str = new TextDecoder('utf-8').decode(buf);
	return str;
}


var full = '';

var readValue = function(info) { //info is the callback parameter passed by serial.onReceive
	//i'm going to assume for the purposes of rapid development that there is only one serial connection at a time
	var str = convertArrayBufferToString(info.data);
	for(var i = 0; i < str.length; i++) {
		if(str[i] !== '\n' && str[i] !== '\r') {
			full += str[i];
		} else {
			if (full.length > 0) {
				console.log(full);
			}
			full = '';
		}
	}
}

connect.addEventListener('click', function() {
	var path = connections.options[connections.selectedIndex].value;
	chrome.serial.getConnections(function(allConnections) {
		for (var connection of allConnections) {
			if(path == connection.name) {
				console.log("already connected to " + path);
				return;
			}
		}
		chrome.serial.connect(path, {bitrate: 9600, name: path}, openConnection);	
	});
});

chrome.serial.onReceive.addListener(readValue);





window.onload = loadConnections;
refresh.addEventListener("click", loadConnections);