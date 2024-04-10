document.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(sessionStorage.getItem('userData'));
    const userId = userInfo.idUsuario;

    // Verificar si no hay información de usuario en sessionStorage
    if (!userInfo) {
        // Redireccionar a la página de inicio de sesión
        window.location.href = '../index.html';
        return; // Detener la ejecución del resto del código
    }

    const userFullName = userInfo.nombres + ' ' + userInfo.apellidos;
    document.getElementById('user-info').textContent = userFullName;

    document.getElementById('logout-link').addEventListener('click', function() {
        sessionStorage.removeItem('userData');
        window.location.href = '../index.html';
    });

    axios.get('https://chat-app-back-1.azurewebsites.net/usuario/v1/getAllUsuarios')
        .then(function(response) {
            const userList = response.data;
            const userListContainer = document.getElementById('user-list');
            userListContainer.innerHTML = '';

            // Llenar la tabla con los datos de usuarios
            userList.forEach(function(user) {
                if (user.idUsuario !== userId) {
                    const row = document.createElement('tr');
                    const cell = row.insertCell(0);
                    cell.innerHTML = `<i class="fas fa-user"></i>`;

                    const cell2 = row.insertCell(1);
                    cell2.innerHTML = `${user.nombres} ${user.apellidos}`;
                    
                    getUnreadMessagesIndicator(userInfo.idUsuario, user.idUsuario)
                        .then(unreadMessagesCount => {
                            console.log(unreadMessagesCount)
                            if (unreadMessagesCount > 0) {
                                cell2.innerHTML += ` <span class="badge badge-primary" id="unread-count">${unreadMessagesCount}</span>`;
                            }
                        })
                        .catch(error => {
                            console.error('Error al obtener la cantidad de mensajes no leídos:', error);
                        });

                    const cell3 = row.insertCell(2);
                    const button = document.createElement('button');
                    button.className = 'btn btn-link';
                    button.setAttribute('data-user-id', user.idUsuario);
                    button.innerHTML = `<i class="fas fa-comment"></i>`;
                    button.onclick = function() {
                        openChat(this);
                    };
                    cell3.appendChild(button);

                    userListContainer.appendChild(row);
                }
            });
        })
        .catch(function(error) {
            console.error('Error al obtener datos de usuarios:', error);
        });
});

function openChat(button) {
    const userId = button.getAttribute('data-user-id');
    // Llamar al endpoint GET para obtener los datos del usuario seleccionado
    axios.get(`https://chat-app-back-1.azurewebsites.net/usuario/v1/usuario/${userId}`)
        .then(function(response) {
            // Guardar los datos obtenidos en la sesión del navegador
            sessionStorage.setItem('chatUser', JSON.stringify(response.data));
            // Redireccionar a la página de chat
            window.location.href = '../pages/chat.html';
        })
        .catch(function(error) {
            console.error('Error al obtener datos del usuario:', error);
        });
}

function getUnreadMessagesIndicator(userSender, userRecipient) {
    return axios.get(`https://chat-app-back-1.azurewebsites.net/usuario/v1/noLeidos?sender=${userSender}&recipent=${userRecipient}`)
        .then(function(response) {
            const unreadMessagesCount = response.data;
            if (unreadMessagesCount > 0) {
                return unreadMessagesCount;
            } else {
                return '';
            }
        })
        .catch(function(error) {
            console.error('Error al obtener la cantidad de mensajes no leídos:', error);
            return '';
        });
}
