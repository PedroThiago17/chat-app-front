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
                            row.innerHTML = `
                                <td><i class="fas fa-user"></i></td>
                                <td>${user.nombres} ${user.apellidos}</td>
                                <td>
                                    <button class="btn btn-link" data-user-id="${user.idUsuario}" onclick="openChat(this)">
                                        <i class="fas fa-comment"></i>
                                    </button>
                                </td>
                            `;
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
    axios.get(`https://chat-app-back-1.azurewebsites.net//usuario/v1/usuario/${userId}`)
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
