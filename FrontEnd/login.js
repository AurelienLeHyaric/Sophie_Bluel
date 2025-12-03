const form = document.querySelector('form')
// Ajoute un gestionnaire d'événements pour l'événement 'submit' sur le formulaire
form.addEventListener('submit', (event) => {
    event.preventDefault()     // Empêche le rechargement de la page
    const champMail = document.getElementById('email')
    const champPassword = document.getElementById('password')
    const valeurMail = champMail.value
    const valeurPassword = champPassword.value
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

        // Vérifie si les champs de mail et/ou de mot de passe sont vides et affiche une alerte si c'est le cas.
    if (valeurMail === "" && valeurPassword === "") {
        alert('Les champs Email et Password sont vides')
    } else if (valeurMail === "") {
        alert('Le champ Email est vide')
    } else if (valeurPassword === "") {
        alert('Le champ Password est vide')
    // Vérifie si le format de l'email est invalide et affiche une alerte si c'est le cas.
    } else if (!regexEmail.test(valeurMail)) {
        alert('Le format de l\'email est invalide')
    // Si tout est correct, appelle la fonction `submitFormulaire` avec les valeurs de mail et de mot de passe.
    } else {
        submitFormulaire(valeurMail, valeurPassword)
    }
})
// Définit la fonction `submitFormulaire` pour envoyer les données de connexion.
function submitFormulaire (email, password) {
        // Envoie une requête POST à l'API avec l'email et le mot de passe.
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {"Content-Type" : "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
        .then(response => {
            // Vérifie si la réponse du serveur n'est pas OK et affiche une alerte.
            if (!response.ok) {
                alert('Erreur dans l’identifiant ou le mot de passe')
            }
            // Retourne la réponse au format JSON si la requête est OK.
            return response.json()
        })
        .then(data => {
            // Si la réponse contient un token, stocke ce token dans localStorage et redirige l'utilisateur vers la page d'accueil.
            if (data.token) {
                localStorage.setItem('sessionToken', data.token)
                window.location.href = '/index.html'
            }
})
        // Gère les erreurs de requête et les affiche dans la console.
        .catch(error => {
            alert('Erreur: ', error)
        })
}