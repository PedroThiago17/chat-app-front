document.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(sessionStorage.getItem('userData'));
    const chatUserData = JSON.parse(sessionStorage.getItem('chatUser'));

    if (!userInfo) {
        // Redireccionar a la página de inicio de sesión
        window.location.href = '../index.html';
        return; // Detener la ejecución del resto del código
    }

    const userFullName = userInfo.nombres + ' ' + userInfo.apellidos;
    const userChatFullName = chatUserData.nombres + ' ' + chatUserData.apellidos;

    document.getElementById('user-info').textContent = userFullName;
    document.getElementById('user-chat-info').textContent = userChatFullName + ':';

    document.getElementById('logout-link').addEventListener('click', function() {
        sessionStorage.removeItem('userData');
        window.location.href = '../index.html';
    });

    function loadChatMessages(sender, recipient) {
        axios.get('https://chat-app-back-1.azurewebsites.net/usuario/v1/mensajes', {
            params: {
                sender: sender,
                recipent: recipient
            }
        })
        .then(response => {
            const messages = response.data;
            if(messages) {
                messages.forEach(message => {
                    // Verificar si el mensaje es del usuario actual o del otro usuario
                    const senderId = parseInt(message.userSender);
                    const isCurrentUser = senderId === userInfo.idUsuario;
                    const messageData = {
                        content: message.message,
                        sender: message.userSender,
                        recipient: message.userRecipent
                    }
                    // Agregar el mensaje al chat
                    addMessageToChat(messageData, isCurrentUser);
                });
            } 
        })
        .catch(error => {
            console.error('Error al cargar los mensajes del chat:', error);
        });
    }

    // Llamar a la función para cargar los mensajes del chat al abrir la página
    loadChatMessages(userInfo.idUsuario, chatUserData.idUsuario);

    // Establecer conexión con el servicio de websocket
    const socket = new WebSocket('wss://chat-app-back-1.azurewebsites.net:443/chat');

    // Manejar eventos del websocket
    socket.onopen = function(event) {
        console.log('Conexión establecida');
    };

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        // Procesar el mensaje recibido
        console.log('Mensaje recibido:', message);
        // Verificar si el mensaje está destinado al usuario actual y proviene del usuario con el que se está chateando
        if ((message.sender === userInfo.idUsuario && message.recipient === chatUserData.idUsuario) || 
            (message.sender === chatUserData.idUsuario && message.recipient === userInfo.idUsuario)) {
            addMessageToChat(message, message.sender === userInfo.idUsuario);
        }
    };

    socket.onerror = function(error) {
        console.error('Error en la conexión websocket:', error);
    };

    // Función para enviar un mensaje a través del WebSocket y a través de la API REST
    function sendMessage(message) {
        // Enviar el mensaje a través del WebSocket
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.error('La conexión websocket no está abierta');
        }
        
        const data = {
            userSender: message.sender,
            userRecipent: message.recipient,
            message: message.content
        };

        // Enviar el mensaje a través de la API REST utilizando Axios
        axios.post('https://chat-app-back-1.azurewebsites.net/usuario/v1/saveMensaje', data)
        .then(response => {
            console.log('Mensaje guardado correctamente');
        })
        .catch(error => {
            console.error('Error al guardar el mensaje:', error);
        });
    }

    // Capturar el mensaje del campo de texto y enviarlo al servidor al hacer clic en el botón
    document.getElementById('send-button').addEventListener('click', function(event) {
        event.preventDefault();
        const messageText = document.getElementById('message-text').value;
        const messageToSend = {
            sender: userInfo.idUsuario,
            recipient: chatUserData.idUsuario,
            content: messageText
        };
        sendMessage(messageToSend);
        // Limpiar el campo de texto después de enviar el mensaje
        document.getElementById('message-text').value = '';
    });
});

function addMessageToChat(message, isCurrentUser) {
    const chatContainer = document.getElementById('chat-container');
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('chat-message');
    if (isCurrentUser) {
        messageWrapper.classList.add('user-fogueado');
    } else {
        messageWrapper.classList.add('chat-partner');
    }

    // Contenido del mensaje (texto y hora)
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = message.content;
    messageWrapper.appendChild(messageText);

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    const messageDate = new Date(message.timestamp);
    const formattedTime = messageDate instanceof Date && !isNaN(messageDate) ? messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    messageTime.textContent = formattedTime;
    messageWrapper.appendChild(messageTime);

    // Agregar la burbuja del mensaje al contenedor del chat
    chatContainer.appendChild(messageWrapper);

    // Desplazarse hacia abajo para mostrar el mensaje más reciente
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
