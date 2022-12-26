/* Récuperation de l'id du produit au sein de l'URL de la page */
function getIdFromUrl() {
    const str = window.location.href;
    const url = new URL(str);
    return url.searchParams.get('id');
}

/* Récuperation du produit auprès de l'API */
async function getProduct(id) {
    const api = 'http://localhost:3000/api/products/';
    const apiPath = api + id;
    return fetch(apiPath)
        .then((response) => response.json())
        .catch((error) => console.log(error));
}

/* Intégration du produit au sein de la page HTML*/
function insertProduct(product) {
/* Insertion de l'image */
    const itemImage = document.querySelector('.item__img');
    const image = document.createElement('img');
    itemImage.appendChild(image);
    image.setAttribute('src', product.imageUrl);
    image.setAttribute('alt', product.altTxt);
/* Insertion du titre */
    const title = document.getElementById('title');
    title.innerHTML = product.name
/* Insertion du prix */
    const price = document.getElementById('price');
    price.innerHTML = product.price
/* Insertion de la description */
    const description = document.getElementById('description');
    description.innerHTML = product.description
/* Insertion des options de couleurs */
    const select = document.querySelector('select');
    formatColors(select, product.colors);
}

/* Création d'une option par couleur possible du produit*/
function formatColors(select, colors) {
    for (let i of colors) {
        const newOption = document.createElement('option');
        select.appendChild(newOption);
        newOption.setAttribute('value', i);
        newOption.innerHTML = i;
    }
}

/* Bouton pour ajouter un produit au panier */
function buttonItemToCart() {
    const button = document.getElementById('addToCart');
    button.addEventListener('click', addItemToCart);
}

/* Ajout d'un produit dans le storage */
async function addItemToCart() {
    /* Mise en place des variables nécessaires */
    const id = getIdFromUrl();
    const selectColor = document.querySelector('select');
    const selectNumber = document.querySelector('input');
    const quantity = parseInt(selectNumber.value)
    /* Création de l'objet produit */
    let informationProduct = {
        id: id,
        quantity: quantity,
        color: selectColor.value
    };
    /* Récupération des produits au sein de localStorage */
    let productsInStorage = JSON.parse(localStorage.getItem('products'));
    /* Création d'un tableau si localStorage vide */
    if (productsInStorage === null) {
        productsInStorage = [];
    }
    /* Verification de la couleur selectionnée */
    if (informationProduct.color === '') {
        alert('Erreur / Veuillez sélectionner une couleur.');
    }
    /* Verification de la quantité selectionnée */
    else if (informationProduct.quantity === 0) {
        alert('Erreur / Veuillez sélectionner une quantité.');
    }
    else if (informationProduct.quantity > 100) {
        alert('Erreur / Veuillez sélectionner une quantité valide : inférieur à 100.');
    } else {
        /* Ajout du produit au localStorage */
        const productIndex = productsInStorage.findIndex(product => product.id === id && product.color === selectColor.value);
        if (productIndex === -1) {
            productsInStorage.push(informationProduct);
        } else {
            /* Incrémentation de la quantité selectionnée */
            if (productsInStorage[productIndex].quantity + quantity <= 100) {
                productsInStorage[productIndex].quantity += quantity;
            } else {
                /* Verification de la quantité totale du panier */
                alert('Erreur / Votre panier dépasse le nombre d\'article autorisés : 100 articles maximum.');
                return
            }
        }
        localStorage.setItem('products', JSON.stringify(productsInStorage));
        alert('Votre Panier a bien été mis à jour.');
        console.log(informationProduct.quantity);
    }
}

/* Display */
async function display() {
    const id = getIdFromUrl();
    const product = await getProduct(id);
    insertProduct(product);
    buttonItemToCart();
}

display();