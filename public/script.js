document.addEventListener('DOMContentLoaded', function () {
    const sendMessageButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const widgetBody = document.getElementById('widget-body');
    const customLauncher = document.getElementById('custom-launcher');
    const closeWidget = document.getElementById('close-widget');
    const widgetContainer = document.getElementById('widget-container');
    const deleteSessionButton = document.getElementById('delete-session');

    customLauncher.addEventListener('click', function () {
        widgetContainer.classList.toggle('hidden');
    });


    closeWidget.addEventListener('click', function () {
        widgetContainer.classList.add('hidden');
    });

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendMessageButton.addEventListener('click', sendMessage);

    deleteSessionButton.addEventListener('click', function () {
        Genesys("command", "MessagingService.clearSession",
        {},
        function() {
            /*fulfilled callback*/
            widgetBody.innerHTML = ''; // Clear chat messages from UI
            console.log('Session cleared');
        },
        function() {
            /*rejected callback*/
            console.log('Error clearing session');
        });
    });
    
    function sendMessage() {
        console.log("Sending message");
        const message = messageInput.value.trim();
        console.log("hiiiiiiiiiiiiiiiii " + message);
        if (message) {
            const messageContainer = document.createElement('div');
            messageContainer.classList.add('message-container', 'outgoing');

            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.classList.add('message-text', 'outgoing');

            messageContainer.appendChild(messageElement);
            widgetBody.appendChild(messageContainer);

            messageInput.value = '';
            widgetBody.scrollTop = widgetBody.scrollHeight; // Scroll to the bottom

            // Genesys sendMessage function
            Genesys("command", "MessagingService.sendMessage", 
                { 
                    message: message 
                }, 
                function() { 
                    // fulfilled callback
                    console.log("Message sent successfully!");
                }, 
                function(error) { 
                    // rejected callback
                    console.error("Failed to send message:", error);
                } 
            );
            
        }
    }

    function sendQuickReplyMessage(quickReplyText) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', 'outgoing');
        const messageElement = document.createElement('div');
        messageElement.textContent = quickReplyText;
        messageElement.classList.add('message-text', 'outgoing');
        messageContainer.appendChild(messageElement);
        widgetBody.appendChild(messageContainer);
        widgetBody.scrollTop = widgetBody.scrollHeight;

        Genesys("command", "MessagingService.sendMessage",
            { message: quickReplyText },
            function() {
                console.log("Message sent successfully!");
            },
            function(error) {
                console.error("Failed to send message:", error);
            }
        );
    }
   
    // Subscribe to MessagingService ready event
    Genesys('subscribe', 'MessagingService.ready', () => {
        customLauncher.classList.remove('hidden');
        console.log('Messenger is ready');
    });

    // Subscribe to incoming messages
    Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {  
        console.log("data " + JSON.stringify(data));  
        if (data && data.messages) {  
            data.messages.forEach(message => {  
                console.log("Processing message: ", message);  
                if (message.text && message.direction === "Outbound") {  
                    const messageContainer = document.createElement('div');  
                    messageContainer.classList.add('message-container', 'incoming');  
    
                    const messageElement = document.createElement('div'); 

                  // Extract the URL from the [link]( url_2) placeholder
                const linkPattern = /\[link]\(\|\| (.*?) \|\|\)/;
                alert(message.text.match(linkPattern))
                const match = message.text.match(linkPattern);
                alert("match "+match)

                if (match) {
                    const url = match[1];
                    alert("url "+url)
                    const formattedText = message.text.replace(linkPattern, `<a href="${url}" target="_blank">link</a>`);
                    messageElement.innerHTML = formattedText; // Using innerHTML to render the link correctly
                } else {
                    messageElement.textContent = message.text; // Fallback to plain text if no match
                }
                    messageElement.classList.add('message-text', 'incoming');  
    
                    messageContainer.appendChild(messageElement);  
    
                    // Check for QuickReply content 
                    if (message.content && Array.isArray(message.content)) { 
                        const buttonContainer = document.createElement('div');
                        buttonContainer.classList.add('button-container');
    
                        message.content.forEach(contentItem => { 
                            if (contentItem.contentType === "QuickReply" && contentItem.quickReply) { 
                                const button = document.createElement('button'); 
                                button.textContent = contentItem.quickReply.text; 
                                button.classList.add('quick-reply-button'); 
                                button.addEventListener('click', () => { 
                                    // Handle button click, e.g., send a message with the payload 
                                    console.log("Button clicked: ", contentItem.quickReply.payload); 
                                    // You can add code here to send the payload to the server or handle it as needed 
                                   
                                    sendQuickReplyMessage(contentItem.quickReply.payload);
                                    
                                  
                                
                                }); 
                                buttonContainer.appendChild(button); 
                            } 
                        }); 
    
                        messageContainer.appendChild(buttonContainer);
                    } 
    
                    widgetBody.appendChild(messageContainer);  
                    widgetBody.scrollTop = widgetBody.scrollHeight; // Scroll to the bottom  
                }  
            });  
        }  
    });
    
    
});
