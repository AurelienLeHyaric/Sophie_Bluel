// Exécution de la récupération des données et de l'affichage
async function initialiserPage() {
    await fetchData() // Attend que les données soient récupérées avant de continuer
    afficherFiltres(categoriesData) // Affiche les filtres une fois les données récupérées
    afficherTravaux('Tous') // Affiche tous les travaux
    modeEdition() // Configure la page en mode d'édition si l'utilisateur est connecté
}

// Création de 2 variables pour lister les données de catégories et de travaux
let categoriesData = []
let travauxData = []

// Fonction asynchrone pour récupérer les données de l'API en utilisant Promise.all
async function fetchData() {
    try {
        // Création des requêtes sans les envoyer immédiatement
        const categoriesPromise = fetch("http://localhost:5678/api/categories")
        const travauxPromise = fetch("http://localhost:5678/api/works")

        // Utilisation de Promise.all pour attendre que les 2 promesses soient résolues
        const [responseCategories, responseTravaux] = await Promise.all([categoriesPromise, travauxPromise])

        // Vérifie puis transforme les réponses en JSON
        if (!responseCategories.ok) {
            throw new Error('Erreur de communication ' + responseCategories.statusText)
        }
        categoriesData = await responseCategories.json()

        if (!responseTravaux.ok) {
            throw new Error('Erreur de communication ' + responseTravaux.statusText)
        }
        travauxData = await responseTravaux.json()
    }
    catch (error) {
        alert("Erreur : " + error)
    }
}

//Affichage des filtres de catégories en fonction des données reçues de l'API
function afficherFiltres() {
    const filtres = document.getElementById("filtresMenu")
    // Efface les filtres existants
    filtres.innerHTML = ''  
    // Ajoute un élément de filtre 'Tous' avant les autres filtres
        const btnTous = document.createElement('button')
        btnTous.className = 'filtresItem'
        btnTous.textContent = 'Tous'
        // Ajoute un écouteur d'evenement, au clic on affiche tous les travaux via la fonction filtrerTravaux
        btnTous.addEventListener('click', () => afficherTravaux('Tous'))
        // Ajoute le filtre "Tous" à la liste des filtres
        filtres.appendChild(btnTous)
    // Ajoute les autres bouttons de filtres après le filtre "Tous"
        // Utilisation d'un Set pour les catégories uniques
        let categorySet = new Set()
        // Boucle sur chaque catégorie de la galerie
        let i = 0
        while (i < categoriesData.length) {
            const category = categoriesData[i] // On récupère chaque catégorie
                if (!categorySet.has(category.name)) { //on vérifie que la catégorie n'ait pas déjà été ajoutée
                    categorySet.add(category.name)     // on ajoute la catégorie à la liste des filtres si elle n'existe pas
                    const btnCategorie = document.createElement('button') // Nouvelle catégorie unique = nouveau bouton crée
                    btnCategorie.className = 'filtresItem'
                    btnCategorie.textContent = category.name
                    // Ajoute un écouteur d'evenement, au clic on affiche les travaux filtrés par catégorie via la fonction filtrerTravaux
                    btnCategorie.addEventListener('click', () => afficherTravaux(category.name))
                    // Ajoute le filtre (boutton) d'une catégorie donnée à la liste des filtres
                    filtres.appendChild(btnCategorie)
                }
            i++
        }
}

//Affichage des travaux en fonction des données reçues de l'API
function afficherTravaux(categoryName) {
    const gallery = document.querySelector(".gallery")
    // Efface le contenu actuel de la galerie
    gallery.innerHTML = ''
    // On détermine quelle liste doit être utilisée, soit la liste complète 'Tous' soit une liste filtrée d'une catégorie spécifiée
    // Cette fonction passe en revue chaque élément (work) de travauxData et vérifie si le nom de la catégorie de l'élément (work.category.name) correspond au nom de la catégorie sélectionnée (categoryName).
    const travaux = (categoryName === 'Tous') ? travauxData : travauxData.filter(work => work.category.name === categoryName)
    // Boucle sur chaque travail filtré pour l'afficher dans la galerie
       let i = 0
       while (i < travaux.length) {
           const work = travaux[i]  // On récupère chaque travail
           const figure = document.createElement('figure') // Crée un élément html "figure"
           figure.className = '.gallery'
           figure.innerHTML = `
               <img src="${work.imageUrl}" alt="${work.title}">
               <figcaption>${work.title}</figcaption>
               `
           gallery.appendChild(figure)  //Ajoute chaque élément figure à la gallerie
           i++
       }
}

//Affichage de la page en mode édition si utilisateur connecté
function modeEdition() {
    const filtres = document.getElementById("filtresMenu")
    const lienLog = document.querySelector('.log')
    const titreMesprojets = document.querySelector('.mesProjets h2')

    if (localStorage.getItem('sessionToken')) {
        // Utilisateur est connecté = mode édition
        filtres.style.display = 'none' // Cache les filtres
        lienLog.innerHTML = "logout" //change le nom 'login' par 'logout'
        lienLog.href = '#'

        // Création du bandeau noir
        const bandeau = document.createElement('div')
        bandeau.id = 'bandeauEdition'
        bandeau.textContent = 'Mode édition'

        // Création de l'élément icône
        const iconeModifier = document.createElement('i')
        iconeModifier.className = 'fa-regular fa-pen-to-square'
        iconeModifier.setAttribute('aria-hidden', 'true')

        // Création de l'élément lien "Modifier"
        const btnEdit = document.createElement('a')
        btnEdit.href = ''
        btnEdit.textContent = ' modifier'
        btnEdit.className = 'edit-link'

        // Insère le bandeau au début du body
        document.body.insertAdjacentElement('afterbegin', bandeau)

        // Décale le reste du contenu pour ne pas être caché par le bandeau
        document.body.style.paddingTop = bandeau.offsetHeight + 'px'

        // Insère l'icône et le lien juste après le h2
        titreMesprojets.insertAdjacentElement('afterend', btnEdit)
        btnEdit.insertAdjacentElement('afterbegin', iconeModifier)

        // Ajoute un écouteur d'événement sur le lien 'logout' si l'utilisateur est connecté
        lienLog.addEventListener('click', (event) => {
            if (localStorage.getItem('sessionToken')) {
                localStorage.removeItem('sessionToken') // Supprime le token de session
                window.location.reload() //on recharge la page
            }
        })

        // Ajoute un écouteur d'événement sur le lien 'Modifier'
        btnEdit.addEventListener('click', function(event) {
            event.preventDefault() // Empêche la navigation
            afficherModale1() // Affiche la modale
        })
        
    }
}

// Affichage de la modale Galerie photos
function afficherModale1() {
    let modal = document.getElementById('modale1')
    // si la modale n'existe pas déjà, renvoie vers la fonction creerModale1 pour la créer
    if (!modal) {
        modal = creerModale1(travauxData).style.display = 'flex'
    } else {
    // si la modale existe déjà, on l'affiche
        const modalGallery = modal.querySelector('.modal-gallery')
        donneesGalerieModale1(modalGallery, travauxData) // Met à jour la galerie avec les données actuelles
        modal.style.display = 'flex' // Affichage de la modale
    }
}

// Création de la modale affichage de la "galerie photo"
function creerModale1(travauxData) {
    const modal = document.createElement('div')
    modal.id = 'modale1'
    modal.className = 'modaleGalerie'

    // Création du contenu de la modale
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    
    // Ajout du bouton de fermeture
    const closeButton = document.createElement('span')
    closeButton.className = 'closeBtn'
    closeButton.innerHTML = '&times;'
    
    // Ajout du titre 'Galerie photo'
    const modalText = document.createElement('p')
    modalText.textContent = 'Galerie photo'
    
    //Ajout de la gallerie photo à partir des données récupérées via la fonction donneesGalerieModale1
    const gallery = document.createElement('div')
    gallery.className = 'modal-gallery'
    donneesGalerieModale1(gallery, travauxData)
    
    //Ajout du boutton "Ajouter une photo"
    const addPhotoBtn = document.createElement('button')
    addPhotoBtn.className = 'addButton'
    addPhotoBtn.textContent = 'Ajouter une photo'
    
    // Rattachement des éléments au DOM
    modalContent.appendChild(closeButton)
    modalContent.appendChild(modalText)
    modalContent.appendChild(gallery)
    modalContent.appendChild(addPhotoBtn)
    // Ajout de tout le contenu (boutons, titre, gallerie)  à la modale
    modal.appendChild(modalContent)
    // Ajout de la modale au corps de la page
    document.body.appendChild(modal)

    //Ajout d'un écouteur d'événement pour basculer (au clic) vers la modale du formulaire d'import de photos
    addPhotoBtn.addEventListener('click', function() {
        //On cache la modale "Galerie photo" pour afficher la modale d'import de photos
        modal.style.display = 'none'
        creerModale2().style.display = 'flex'
    })

    return modal
}

// Récupération des données pour ajout à la modale Gallerie photo
function donneesGalerieModale1(gallery, travauxData) {
    // Ajout de toutes les photos à partir des données déjà récupérées via l'API
    gallery.innerHTML = '' // Vide la galerie avant de la reconstruire
    gallery.className = 'modal-gallery'
    //Boucle sur la liste de données (travaux)
    let i = 0
    while (i < travauxData.length) {
        const work = travauxData[i]
        // Ajout du container image
        const imgContainer = document.createElement('div')
        imgContainer.className = 'img-container'
        // Ajout des éléments images
        const img = document.createElement('img')
        img.src = work.imageUrl
        img.alt = work.title
        // Ajout du bouton pour supprimer les photos
        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'deleteBtn'
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can fa-sm"></i>'
        deleteBtn.setAttribute('aria-hidden', 'true')
        // Attribue un identifiant pour chaque conteneur d'image basé sur l'ID du travail
        imgContainer.id = `photo-${work.id}` // chaque photo a un ID unique

        // Ajout d'un écouteur d'événement pour supprimer la photo
        deleteBtn.addEventListener('click', () => supprimerPhotoModale1(work.id))

        // Rattachement des éléments au DOM
        imgContainer.appendChild(img)
        imgContainer.appendChild(deleteBtn)
        gallery.appendChild(imgContainer)
        i++
    }
}

// Supprimer une photo de la gallerie
async function supprimerPhotoModale1(photoId) {
    // Récupération du token
    const sessionToken = localStorage.getItem('sessionToken')
    try {
        const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        })
        // Vérifie si la réponse est une erreur 
        if (!response.ok) {
            throw new Error('Problème avec la requête : ' + response.statusText)
        }

        // Supprime l'élément de la galerie photo dans la mdoale
        const photoASupprimer = document.getElementById(`photo-${photoId}`)
        // Vérifie si l'élément existe et, dans ce cas, le supprime du DOM
        if (photoASupprimer) {
            photoASupprimer.remove()
        }
        
        // Mise à jour des données de travaux en tenant compte du travail (photo) supprimé : on exclue l'élément dont l'identifiant correspond à photoId.
        travauxData = travauxData.filter(travail => travail.id !== photoId)
        // Rafraîchit l'affichage de la galerie pour refléter la suppression
        afficherTravaux('Tous')

    } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message)
    }
}

// Création de la modale "ajout photos"
function creerModale2 () {
     // Vérifie si la modale existe déjà pour éviter d'en avoir plusieurs d'ouvertes à la fois
    let modal2 = document.getElementById('modale2')
    // Si la modale n'existe pas, on l'a crée
    if (!modal2) {
    modal2 = document.createElement('div')
    modal2.id = 'modale2'
    modal2.className = 'modaleFormulaire'

    // Création du contenu de la modale
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    
    // Ajout du bouton "précédent"
    const prevButton = document.createElement('span')
    prevButton.className = 'prevBtn'
    prevButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i>'
    
    // Ajout du bouton de fermeture
    const closeButton = document.createElement('span')
    closeButton.className = 'closeBtn'
    closeButton.innerHTML = '&times;'
    
    // Ajout du titre 'Ajout photo'
    const modalText = document.createElement('p')
    modalText.textContent = 'Ajout photo'

    // Mise en place du formulaire depuis la fonction formulaireModale2
    const form = formulaireModale2()

    //Rattachement des éléments au DOM
    modalContent.appendChild(prevButton)
    modalContent.appendChild(closeButton)
    modalContent.appendChild(modalText)
    modalContent.appendChild(form)
    modal2.appendChild(modalContent)
    document.body.appendChild(modal2)

} else {
    // Si la modale existe déjà, on l'affiche
    modal2.style.display = 'flex'
}

return modal2
}

// Création du formulaire d'import photo pour la "modale2"
function formulaireModale2 () {
    // Création de l'élément formulaire
    const form = document.createElement('form')
    form.id = 'formulaireImport'
   
    // Création du bouton pour ajouter une photo
    const addPhotoButton = document.createElement('button')
    addPhotoButton.className = 'ajoutPhoto'
    addPhotoButton.setAttribute('aria-label', 'Ajouter une photo')
    addPhotoButton.innerText = '+ Ajouter photo'

    // Création de l'"input" pour sélectionner des photos
    const photoInput = document.createElement('input')
    photoInput.type = 'file'
    photoInput.id = 'photo'
    photoInput.style.display = 'none' // Cache l'input pour ne pas le rendre visible directement
    photoInput.accept = 'image/png, image/jpeg' // Restreint les types de fichiers acceptés

    // Création d'un label pour l'input de photo, qui contiendra le bouton et d'autres informations
    const photoLabel = document.createElement('label')
    photoLabel.className = 'photoLabelForm'    

    // Création d'un conteneur pour une icône (SVG) à l'intérieur du label
    const photoLabelIcone = document.createElement('div')
    const photoLabelSvg = document.createElement('i')
    photoLabelIcone.className = 'icone'
    photoLabelSvg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="76" width="76" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#b9c5cc" d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>'

    // Configuratoin du label pour l'affichage
    const photoLabelInfo = document.createElement('div')
    photoLabelInfo.className = 'fileInfo'
    photoLabelInfo.innerText ='jpg, png : 4mo max'

    // Ajoutez ici le nouvel élément d'aperçu d'image
    const imgPreview = document.createElement('img')
    imgPreview.innerHTML = '' // Efface les aperçus existants
    imgPreview.id = 'imagePreview'
    imgPreview.style.display = 'none' // Cachez l'aperçu par défaut

    // Création d'une zone de saisie pour le titre de la photo
    const titleInput = document.createElement('input')
    titleInput.type = 'text'
    titleInput.id = 'titleInput'
    titleInput.placeholder = ''
    const titleLabel = document.createElement('label')
    titleLabel.setAttribute('for', 'title')
    titleLabel.textContent = 'Titre'
    titleLabel.id = 'titleLabel'

    // Création et ajout d'une zone de sélection pour la catégorie de la photo
    const categorySelect = document.createElement('select')
    categorySelect.id = 'categorySelect'
    const categoryLabel = document.createElement('label')
    categoryLabel.id = 'categoryLabel'
    categoryLabel.setAttribute('for', 'category')
    categoryLabel.textContent = 'Catégorie'
    // On affiche par défaut une catégorie "vide" qui est choisie dans l'affichage dans la zone de select
    const defaultOption = document.createElement('option')
    defaultOption.value = ''
    defaultOption.selected = true // On sélectionne cette option par défaut
    defaultOption.disabled = true // On ne permet pas à l'utilisateur de choisir cette option
    categorySelect.appendChild(defaultOption)
    // Remplissage des options de catégories avec une boucle
    let i = 0
    while (i < categoriesData.length) {
        const category = categoriesData[i]
        const option = document.createElement('option')
        option.value = category.name
        option.textContent = category.name
        categorySelect.appendChild(option)
        i++
    }

    // Ajoute une ligne de séparation en -dessous du formulaire
    const trait = document.createElement('div')
    trait.id = 'trait'

    // Création et ajout du bouton de soumission du formulaire
    const submitBtn = document.createElement('button')
    submitBtn.id = 'submitBtn'
    submitBtn.type = 'submit'
    submitBtn.textContent = 'Valider'

    // Ajout des messages d'erreur (cachés) en prévision de les afficher via la fonction "validationFormModale2"
    const photoErrorMsg = document.createElement('div')
    photoErrorMsg.id = 'photoErrorMsg'
    photoErrorMsg.style.color = 'red'
    photoErrorMsg.style.display = 'none'
    const titleErrorMsg = document.createElement('div')
    titleErrorMsg.id = 'titleErrorMsg'
    titleErrorMsg.style.color = 'red'
    titleErrorMsg.style.display = 'none'
    const categoryErrorMsg = document.createElement('div')
    categoryErrorMsg.id = 'categoryErrorMsg'
    categoryErrorMsg.style.color = 'red'
    categoryErrorMsg.style.display = 'none'


    //Rattachement des éléments au DOM
    photoLabelIcone.appendChild(photoLabelSvg)
    photoLabel.appendChild(photoLabelIcone)
    photoLabel.appendChild(addPhotoButton)
    photoLabel.appendChild(photoLabelInfo)
    form.appendChild(photoInput)
    form.appendChild(photoLabel)
    form.appendChild(imgPreview)
    form.appendChild(photoErrorMsg)
    form.appendChild(titleLabel)
    form.appendChild(titleInput)
    form.appendChild(titleErrorMsg)
    form.appendChild(categoryLabel)
    form.appendChild(categorySelect)
    form.appendChild(categoryErrorMsg)
    form.appendChild(trait)
    form.appendChild(submitBtn)

    //Ecouteurs d'événements
    // Ouverture du sélecteur de fichier quand le bouton "Ajouter photo" est cliqué
    addPhotoButton.addEventListener('click', (e) => {
        e.preventDefault() // Empêche toute action par défaut
        photoInput.click() // Déclenche le clic sur l'input de fichier
    })

    // Switch de l'affichage du bouton Valider en fonction du remplissage complet ou non du formulaire
    form.addEventListener('input', () => {
        // Vérifie si tous les champs obligatoires sont remplis
        const photoOK = photoInput.files.length > 0 // Vérifie si une photo est sélectionnée
        const titleOK = titleInput.value.trim().length > 0 // Vérifie si le titre est rempli
        const categoryOK = categorySelect.value // Vérifie si une catégorie est sélectionnée
        // Détermine si le formulaire est valide
        const formOK = photoOK && titleOK && categoryOK
        // Si le formulaire est valide, change la classe du bouton de soumission pour refléter l'état du formulaire
        submitBtn.id = formOK ? 'submitBtnActive' : 'submitBtn'
    })

    // Clic sur le bouton de validation
    form.addEventListener('submit', e => {
        e.preventDefault() // Empêche la soumission automatique du formulaire
        validationFormModale2() //renvoi vers la fonction de validation du formulaire
    })

    //Affiche la prévisualisation d'image
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0] // Récupère le fichier sélectionné (forcément le premier)
    
        // Vérifie la présence du fichier image
        if (file && (file.type === "image/png" || file.type === "image/jpeg"))  {
            // Si un fichier est sélectionné et qu'il est du bon type, continuez le traitement
            imgPreview.src = URL.createObjectURL(file) // Prévisualisation de l'image
            imgPreview.onload = function() {
                URL.revokeObjectURL(imgPreview.src) // Nettoie l'URL de l'objet après le chargement
            }
            imgPreview.style.display = 'block' // Affiche la prévisualisation
            photoErrorMsg.style.display = 'none' // Cache le message d'erreur, s'il est visible
            photoLabel.style.display = 'none'
        } else {
            // Si le fichier n'est pas de type PNG ou JPEG
            photoErrorMsg.textContent = 'Veuillez sélectionner une image au format PNG ou JPEG'
            photoErrorMsg.style.display = 'block' // Montre un message d'erreur
            imgPreview.style.display = 'none' // Cache la prévisualisation de l'image
            photoLabel.style.display = 'block' // Affiche de nouveau le module d'import
        }
    })
    
    //Cache le message d'erreur si l'utilisateur saisi dans la zone de titre
    titleInput.addEventListener('input', () => {
        if (titleInput.value.trim().length > 0) { // Si le titre est non-vide
            titleErrorMsg.style.display = 'none' // Cache le message d'erreur
        }
    })

    //Cache le message d'erreur si l'utilisateur sélectionne une catégorie
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value) { // Si une catégorie est sélectionnée
            categoryErrorMsg.style.display = 'none' // Cache le message d'erreur
        }
    })

    // Retourne le formulaire complété
    return form
}

// Validation du formulaire
async function validationFormModale2() {
    // Sélection des éléments du formulaire et des zones de message d'erreur
    const photoInput = document.getElementById('photo')
    const titleInput = document.getElementById('titleInput')
    const categorySelect = document.getElementById('categorySelect')
    const photoErrorMsg = document.getElementById('photoErrorMsg')
    const titleErrorMsg = document.getElementById('titleErrorMsg')
    const categoryErrorMsg = document.getElementById('categoryErrorMsg')
  
    // Réinitialise les messages d'erreur
    photoErrorMsg.style.display = 'none'
    titleErrorMsg.style.display = 'none'
    categoryErrorMsg.style.display = 'none'

    // Récupère les valeurs des champs du formulaire
    const title = titleInput.value.trim()
    const imageFile = photoInput.files[0] // On suppose qu'un seul fichier est sélectionné
    const categoryName = categorySelect.value
    let formValid = true // Flag de validité du formulaire
     
    // Vérifications des champs et affichage des messages d'erreur si nécessaire
    if (!imageFile) {
        photoErrorMsg.textContent = 'Photo non importée'
        photoErrorMsg.style.display = 'block'
        formValid = false
    } else if (imageFile.type !== "image/jpeg" && imageFile.type !== "image/png") {
        // Vérifie si le fichier est ni un JPEG ni un PNG
        photoErrorMsg.textContent = 'Le fichier doit être au format JPEG ou PNG'
        photoErrorMsg.style.display = 'block'
        formValid = false // Met à jour la validité du formulaire
    } else {
        // Le fichier est correct, on peut réinitialiser le message d'erreur si nécessaire
        photoErrorMsg.style.display = 'none'
    }
         
    if (!title) {
        titleErrorMsg.textContent = 'Titre non défini'
        titleErrorMsg.style.display = 'block'
        formValid = false
    }
    if (!categoryName) {
        categoryErrorMsg.textContent = 'Catégorie non sélectionnée'
        categoryErrorMsg.style.display = 'block'
        formValid = false
    }
     
    // Soumet les données si le formulaire est valide
    if (formValid) {
        envoiFormulaireModale2(title, imageFile, categoryName)
    }
}

// Envoi des données du formulaire d'import
async function envoiFormulaireModale2(title, imageFile, categoryName) {
    // Trouve l'ID de catégorie correspondant au nom de la catégorie sélectionnée
    const category = categoriesData.find(cat => cat.name === categoryName)
        // Vérifie si la catégorie existe, sinon affiche une alerte et interrompt la fonction
    if (!category) {
        alert('Catégorie non trouvée')
        return
    }
    // Récupère l'identifiant de la catégorie sélectionnée
    const categoryId = category.id

    // Crée un FormData on lui ajoute les champs nécessaires
    const formData = new FormData()
    formData.append('title', title)
    formData.append('image', imageFile)
    formData.append('category', categoryId)
    
    // Récupération du token stovké en local
    const sessionToken = localStorage.getItem('sessionToken')

    // Effectue la requête POST pour l'envoi des données
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            },
            body: formData
        })

        // Vérifie si la requête a échoué (réponse non OK)
        if (!response.ok) {
            // Si le code de réponse est 401, demande à l'utilisateur de se reconnecter
            if (response.status === 401) {
                alert('Votre session a expiré, veuillez vous reconnecter.')
                return // Arrête l'exécution de la fonction après l'alerte
            }
            throw new Error('Problème avec la requête : ' + response.statusText)
        }

        // Décode la réponse JSON reçue du serveur.
        const result = await response.json()

        // Ajoute le nouveau projet aux données locales pour une mise à jour instantanée de l'affichage
        travauxData.push(result)
        // Rafraîchit l'affichage des travaux avec les nouvelles données
        afficherTravaux('Tous')
        // Rafraîchit l'affichage des travaux de la modale Galerie photo avec les nouvelles données
        let modalGallery = document.querySelector('.modal-gallery')
        if (modalGallery) {
            donneesGalerieModale1(modalGallery, travauxData) // Mise à jour des données de la gallerie photo
        }

        document.querySelector('.modaleGalerie').style.display = 'flex'  // Affiche la modale Gallerie photo
        document.querySelector('.modaleFormulaire').style.display = 'none'  // Cache la modale Import photo


        // Réinitialisation des champs du formulaire pour une nouvelle saisie
        resetFormulaireModale2()

    // Gère les erreurs potentielles de la requête
    } catch (error) {
        alert('Erreur lors de l\'envoi: ' + error.message)
    }
}

//Reinitialisation du formulaire
function resetFormulaireModale2() {
    const form = document.getElementById('formulaireImport')
    if (form) {
        form.reset() // Réinitialise tous les champs du formulaire
    }

    const imgPreview = document.getElementById('imagePreview')
    if (imgPreview) {
        imgPreview.style.display = 'none' // Cache l'aperçu de l'image
        imgPreview.src = '' // Supprime la source de l'image
    }
    // Réinitialise photoLabel
    const photoLabel = document.querySelector('.photoLabelForm')
    photoLabel.style.display = 'block'

    // Réinitialise les messages d'erreur/success
    const photoErrorMsg = document.getElementById('photoErrorMsg')
    if (photoErrorMsg) {
        photoErrorMsg.style.display = 'none'
    }
    const titleErrorMsg = document.getElementById('titleErrorMsg')
    if (titleErrorMsg) {
        titleErrorMsg.style.display = 'none'
    }
    const categoryErrorMsg = document.getElementById('categoryErrorMsg')
    if (categoryErrorMsg) {
        categoryErrorMsg.style.display = 'none'
    }
    const messageSuccess = document.getElementById('messageSuccess')
    if (messageSuccess) {
        messageSuccess.style.display = 'none'
    }

    // Réinitialise la sélection de la catégorie à la valeur vide
    const categorySelect = document.getElementById('categorySelect')
    if (categorySelect) {
            categorySelect.value = ''
    }

    // Réinitialise le bouton Valider
    const submitBtn = document.getElementById('submitBtnActive')
    if (submitBtn) {
        submitBtn.id = 'submitBtn'
    }
}

// Gestionnaire d'événements qui concerne l'affichage et la navigation pour les modales
function gestionnaireEvenementsModales() {
    // Fermeture de la modale lorsque l'utilisateur clique sur le bouton de fermeture ou en dehors de la modale
    window.onclick = function(event) {
        const modales = document.querySelectorAll('.modaleGalerie, .modaleFormulaire')  // Récupère toutes les modales
        modales.forEach(modal => {
            if (event.target.classList.contains('closeBtn') || event.target === modal) {
                fermetureModales() // Ferme toutes les modales
                resetFormulaireModale2() // Reset du formulaire
            }
        })

    // Gère le clic sur le bouton précédent dans la modale de formulaire
    const prevButtons = document.querySelectorAll('.modaleFormulaire .prevBtn')
    prevButtons.forEach(button => {
        button.onclick = function() {
                document.querySelector('.modaleGalerie').style.display = 'flex'  // Affiche la modale Gallerie photo
                document.querySelector('.modaleFormulaire').style.display = 'none'  // Cache la modale Import photo
                resetFormulaireModale2() // Reset du formulaire
            }
        })
    }
}

// Fermeture des modales
function fermetureModales() {
    document.querySelector('.modaleGalerie').style.display = 'none'
    document.querySelector('.modaleFormulaire').style.display = 'none'
}

initialiserPage().then(() => {
    gestionnaireEvenementsModales() // Configure le gestionnaire après l'initialisation de la page
})


