var socketio = require("socket.io");
var io;
var guestNumber = 1;
var nickNames = {};
var namesUseds = [];
var currentRoom = {};

function assignGuestName(socket,guestNumber,nickNames,namesUseds){
	var name = "Guest " + guestNumber;
	nickNames[socket.id] = name;
	socket.emit("nameResult",{
		success:true,
		name:name
	});
	namesUseds.push(name);
	return guestNumber + 1;
}

function joinRoom(soscket,room){
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit("joinResult",{"room":room});
	socket.broadcast.to(room).emit("message",{
		text:nickNames[socket.id] + "has joined "+ room + ".";
	});
	var userInRoom = io.sosckets.clients(room);
	if(userInRoom.length > 1){
		var userInRoomSummary = "Users currently in " + room + ": ";
		for(var index in userInRoom){
			var userSocketId = userInRoom[index].id;
			if(userSocketId != socket.id){
				if(index > 0){
					userInRoomSummary += ", ";
				}
				userInRoomSummary += nickNames[userSocketId];
			}
		}
		userInRoomSummary += ".";
		socket.emit("message",{text:userInRoomSummary});
	}
}

function handleNameChangeAttempts(socket,nickNames,namesUseds){
	socket.on("nameAttemp",function(name){
		if(name.indexOf("Guest" == 0)){
			socket.emit("nameResult",{
				success: false,
				messgae: 'Name cannot begin with "Guest".';
			});

		}else{
			if(namesUseds.indexOf(name) == -1){
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUseds.indexOf(previousName);
				namesUseds.push(name);
				nickNames[socket.id] = name;
				delete namesUseds[previousNameIndex];
				socket.emit("nameResult",{
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit("message",{
					text: previousName + "is now known as " + name + ".";
				});
			}else{
				socket.emit("nameResult",{
					success: false,
					message: "That name id already in use.";
				});
			}
		}
	})
}

function handleMessageBroadcasting(socket){//转发消息
	socket.on("message",function(message){
		socket.broadcast.to(message.room).emit("message",{
			text: nickNames[socket.id] + ":" + message.text
		});
	});
}

function handleRoomJoining(socket){
	socket.on("join",function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket,room.newRoom);
	})
}

function handleClientDisconnection(socket){
	socket.on("disconnect",function(){
		var nameIndex = namesUseds.indexOf(nickNames[socket.id]);
		delete namesUseds[nameIndex];
		delete nickNames[socket.id];
	})
}

export.listen = function(server){
	io = socketio.listen(server);
	io.set("log level",1);
	io.sockets.on("connection",function(socket){
		guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUseds);
		joinRoom(socket,"lobby");
		handleMessageBroadcasting(socket,nickNames);
		handleNameChangeAttempts(socket,nickNames,namesUseds);
		handleRoomJoining(socket);
		socket.on("room",function(){
			socket.emit("rooms",io.sockets.manager.rooms);
		});
		handleClientDisconnection(socket,nickNames,namesUseds);
	});
};