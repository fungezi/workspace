function divEscapedContentElement(message){
	return $("<div></div>").text(message);
}
function divSystemContentElement(message){
	return $("<div></div>").html("<i>"+ message + "</i>");
}
function processUserInput(chatApp,socket){
	var message = $("#send-message").val();
	var systemMessage;
	if(messgae.chartAt(0) == "/"){
		systemMessage = chatApp.processCommand(message);
		if(systemMessage){
			$("#messages").append(divEscapedContentElement(systemMessage));
		}
	}else{
		chatApp.sendMessage($("#room").text(),messgae);
		$("#messages").append(divEscapedContentElement(message));
		$("#messages").scrollTop($("#messages").prop("scrollHeight"));
	}
	$("#send-message").val(" ");
}