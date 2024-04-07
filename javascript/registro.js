document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    const email = formData.get('email');
    const nombres = formData.get('nombres');
    const apellidos = formData.get('apellidos');
    const password = formData.get('password');

    const data = {
        correo: email,
        nombres: nombres,
        apellidos: apellidos,
        password: password
    };

    axios.post('https://chat-app-back-1.azurewebsites.net/usuario/v1/saveUsuario', data)
        .then(function(response) {
            if (response.data.idUsuario) {
                // Redirigir al usuario a index.html
                window.location.href = '../index.html';
            }
            console.log(response.data); // Aquí puedes manejar la respuesta del servidor
        })
        .catch(function(error) {
            console.error(error);
        });
});
