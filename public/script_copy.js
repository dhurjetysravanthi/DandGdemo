document.addEventListener('DOMContentLoaded', function () {
    const sendMessageButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const widgetBody = document.getElementById('widget-body');
    const customLauncher = document.getElementById('custom-launcher');
    const closeWidget = document.getElementById('close-widget');

    const widgetContainer = document.getElementById('widget-container');
    const deleteSessionButton = document.getElementById('delete-session');

   let dateInput;
   
   
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
    //added code
    window.addEventListener('beforeunload', function () {
        Genesys("command", "MessagingService.clearSession",
        {},
        function() {
            console.log('Session cleared on page refresh');
        },
        function() {
            console.log('Error clearing session on page refresh');
        });
    });

    // Initialize Flatpickr
  


    
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
            
     
    
  
    
    function handleDateSelection(dateStr) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', 'outgoing');
        const messageElement = document.createElement('div');
        messageElement.textContent = "Selected date: " + dateStr;
        messageElement.classList.add('message-text', 'outgoing');
        messageContainer.appendChild(messageElement);
        widgetBody.appendChild(messageContainer);
        widgetBody.scrollTop = widgetBody.scrollHeight;
        
        Genesys("command", "MessagingService.sendMessage",
            { message:`Selected date: ${dateStr}`},
            function() {
                console.log("Date sent successfully!");
            },
            function(error) {
                console.error("Failed to send date:", error);
            }
        );
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




    


    // Function to process and display structured messages
function processStructuredMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', 'incoming');

    if (message.content && Array.isArray(message.content)) {
        message.content.forEach(contentItem => {
            if (contentItem.contentType === "Card" && contentItem.card) {
                const card = contentItem.card;

                // Create card elements
                const cardContainer = document.createElement('div');
                cardContainer.classList.add('card-container');

                const cardTitle = document.createElement('h3');
                cardTitle.textContent = card.title;
                cardContainer.appendChild(cardTitle);

                const cardDescription = document.createElement('p');
                cardDescription.textContent = card.description;
                cardContainer.appendChild(cardDescription);

                if (card.image) {
                    const cardImage = document.createElement('img');
                    cardImage.src = card.image;
                    cardImage.alt = card.title;
                    cardContainer.appendChild(cardImage);
                }

                // Add action buttons
                if (card.actions && Array.isArray(card.actions)) {
                    const buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');

                    card.actions.forEach(action => {
                        const button = document.createElement('button');
                        button.textContent = action.text;
                        button.classList.add('quick-reply-button');
                        button.addEventListener('click', () => {
                            sendQuickReplyMessage(action.payload);
                           
                        
                        });
                        buttonContainer.appendChild(button);
                    });

                    cardContainer.appendChild(buttonContainer);
                }

                messageContainer.appendChild(cardContainer);
            }
        });
    }

    widgetBody.appendChild(messageContainer);
    widgetBody.scrollTop = widgetBody.scrollHeight; // Scroll to the bottom
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
                    // Modify message text to replace URLs with clickable "link" 
                    const linkRegex = /(https?:\/\/[^\s]+)/g; 
                    const modifiedText = message.text.replace(linkRegex, '<a href="$1" target="_blank">link</a>'); // Use innerHTML to ensure the link is rendered correctly 
                    messageElement.innerHTML = modifiedText; 
                    messageElement.classList.add('message-text', 'incoming');
                    
                  
    
                    messageContainer.appendChild(messageElement); 
                    console.log("Processing message: ", message);
                    widgetBody.appendChild(messageContainer);
                    widgetBody.scrollTop = widgetBody.scrollHeight; // Scroll to the bottom

                    // Show date input if specific prompt is received
                    if (message.text.includes('When would you like to schedule the repair. We have availability throughout this week. Please enter your preferred date.')) {
                        setTimeout(() => {
                        const dateInput = document.createElement('input');
                        dateInput.id = 'date-input';
                        dateInput.type = 'text';
                       
                        widgetBody.appendChild(dateInput);

                        // Initialize Flatpickr
                        flatpickr(dateInput, {
                            dateFormat: "Y-m-d",
                            minDate: "today",
                            onChange: function (selectedDates, dateStr, instance) {
                                // Handle date selection
                                console.log("Selected date: " + dateStr);
                                handleDateSelection(dateStr);
                                dateInput.remove(); // Remove the date input after selection
                            }
                        });

                        dateInput.click(); // Trigger the calendar to open
                    },5000);
                    }
                    
               
                    

                    
                                        
                    
                                         
                   
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
                }else if (message.type === "Structured") {
                        processStructuredMessage(message);
                    }
                }  
            );  
        }  
    });
    

        
    
    
});
//testcode
