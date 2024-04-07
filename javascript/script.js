document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message'); // Referencia al elemento de mensaje de error

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const requestBody = {
            correo: email,
            password: password
        };

        // Envía la solicitud POST
        enviarSolicitud(requestBody);
    });

    function enviarSolicitud(requestBody) {
        // Supongamos que tienes una función `axios` que maneja las solicitudes HTTP
        axios.post('https://chat-app-back-1.azurewebsites.net/usuario/v1/login', requestBody)
            .then(function(response) {
                // Manejar la respuesta exitosa aquí
                console.log('Solicitud POST enviada con éxito:', response.data);
                // Guardar datos del usuario en sessionStorage
                sessionStorage.setItem('userData', JSON.stringify(response.data));
                // Redirigir al usuario a otra página (p. ej., dashboard.html)
                window.location.href = '/pages/main.html';
            })
            .catch(function(error) {
                // Manejar errores de solicitud aquí
                console.error('Error al enviar la solicitud POST:', error);
                errorMessage.textContent = 'Credenciales incorrectas';
                document.getElementById('password').value = '';
            });
    }
});
