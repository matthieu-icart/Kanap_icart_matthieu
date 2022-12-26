/* Création d'un objet rassemblant les coordonnées de l'User */
const userContact = {};

/* Récuperation des produits au sein du localStorage */
function getProductsInStorage() {
  return JSON.parse(localStorage.getItem('products'));
}

/* Récuperation d'un produit auprès de l'API */
async function getProduct(id) {
  const api = 'http://localhost:3000/api/products/';
  const apiPath = api + id;
  return fetch(apiPath)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

/* Création du format HTML du produit */
function formatProduct(product, color, quantity) {
  const cartItems = document.getElementById('cart__items');
  const html = `
  <article class="cart__item" data-id="${product._id}" data-color="${color}">
    <div class="cart__item__img">
      <img src="${product.imageUrl}" alt="${product.altTxt}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__description">
        <h2>${product.name}</h2>
        <p>${color}</p>
        <p>${product.price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté :${quantity}</p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${quantity}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  </article>`
  cartItems.insertAdjacentHTML('beforeend', html);
}

/* Insertion du produit au sein de la page HTML */
async function insertProductsInCart() {
  let products = await getProductsInStorage();
  let totalPrice = 0;
  let totalQuantity = 0;
/* Vérification panier vide */
  if (products == '' || products == null) {
    const cartItems = document.getElementById('cart__items');
    cartItems.innerHTML = '<p>Votre Panier est vide.</p>';
  } else {
    for (let product = 0; product < products.length; product++) {
    /* Création des variables nécessaires */
      let id = products[product].id;
      let color = products[product].color;
      let quantity = products[product].quantity;
      let productInformation = await getProduct(id);
    /* Insertion de chaque produit */
      formatProduct(productInformation, color, quantity);
    /* Incrémentation du prix total */
      totalPrice += productInformation.price * quantity;
      totalQuantity += quantity;
    }
  }
  return { totalPrice, totalQuantity };
}

/* Insertion des totaux */
function totalInsertion(total) {
/*  Quantité total  */
  const totalQuantityHtml = document.getElementById('totalQuantity');
  totalQuantityHtml.innerHTML = total.totalQuantity;
/*  Prix total  */
  const totalPriceHtml = document.getElementById('totalPrice');
  totalPriceHtml.innerHTML = total.totalPrice;
}

/* Boutons de modification */
function updateItemButton() {
  const itemButtons = document.querySelectorAll('.itemQuantity');
  for (let itemButton of itemButtons) {
    updateItem(itemButton);
  }
}

/* Modification de la quantité d'un produit du panier */
function updateItem(itemButton) {
  itemButton.addEventListener("change", () => {
  /* Création des variables nécessaires */
    let productsInStorage = JSON.parse(localStorage.getItem('products'));
    let article = itemButton.closest('article');
    let idProduct = article.getAttribute('data-id');
    let colorProduct = article.getAttribute('data-color');
    const productIndex = productsInStorage.findIndex(product => product.id === idProduct && product.color === colorProduct);
    const selectedQuantity = itemButton.valueAsNumber;
  /* Verification de la quantité selectionnée */
    if (selectedQuantity === 0) {
      alert('Erreur / Veuillez sélectionner une quantité.');
    }
    else if (selectedQuantity > 100) {
      alert('Erreur / Veuillez sélectionner une quantité valide : inférieur à 100.');
    } else {
    /* Ajout du produit au sein du Storage avec la nouvelle quantité */
      if (selectedQuantity <= 100) {
        productsInStorage[productIndex].quantity = selectedQuantity;
        localStorage.setItem('products', JSON.stringify(productsInStorage));
        alert('Votre Panier a bien été mis à jour.');
        location.reload();
      } else {
        alert('Erreur / Votre panier dépasse le nombre d\'article autorisés : 100 articles maximum.');
        return
      }
    }
  });
}

/* Boutons de suppression */
function deleteItemButtons() {
  const buttons = document.querySelectorAll('.deleteItem');
  for (let button of buttons) {
    deleteItem(button);
  }
}

/* Suppression d'un produit du panier */
function deleteItem(button) {
  button.addEventListener("click", () => {
  /* Création des variables nécessaires */
    let productsInStorage = JSON.parse(localStorage.getItem('products'));
    let article = button.closest('article');
    let idProduct = article.getAttribute('data-id');
    let colorProduct = article.getAttribute('data-color');
    const productIndex = productsInStorage.findIndex(product => product.id === idProduct && product.color === colorProduct);
  /* Suppression du produit */
    productsInStorage.splice(productIndex, 1);
    localStorage.setItem('products', JSON.stringify(productsInStorage));
    alert('Votre Panier a bien été mis à jour.');
    location.reload();
  });
}

/* Bouton de validation */
async function postOrderButton() {
  const validationButton = document.getElementById('order');
  validationButton.addEventListener('click', event => {
    event.preventDefault();
    postOrder();
  });
}

/* Construction d'un array d'id obtenu depuis le localStorage */
function getCommand() {
  let products = getProductsInStorage() || [];
  let command = [];
  for (let product of products) {
    command.push(product.id);
  }
  return command;
}

/* Création du format d'objet requis pour la requête POST */
function createOrder(userContact, command) {
  const order = {
    contact: {
      firstName: userContact.firstName,
      lastName: userContact.lastName,
      address: userContact.address,
      city: userContact.city,
      email: userContact.email,
    },
    products: command,
  }
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order),
  };
  return options;
}

/* Envoie de la commande auprès de l'API */
function postOrder() {
  /* Création des variables nécessaires */
  let command = getCommand();
  /* Vérifications panier vide */
  if (command.length === 0) {
    alert('Votre panier est vide');
    return;
  }
  /* Vérification des inputs */
  validateFirstName(userContact);
  validateLastName(userContact);
  validateAddress(userContact);
  validateCity(userContact);
  validateEmail(userContact);
  /* Requête POST auprès de l'API */
  if (Object.keys(userContact).length === 5) {
    let options = createOrder(userContact, command);
    fetch("http://localhost:3000/api/products/order", options)
      .then((response) => response.json())
      .then((data) => {
        localStorage.clear();
        document.location.href = "confirmation.html?orderId="+data.orderId;
      })
      .catch((err) => { alert("Votre commande n'as malheuresement pas pu aboutir : " + err.message); });
  } else {
    console.log('La commande n\'est pas complète.');
  }
}

/* Vérification input firstName */
function validateFirstName() {
  const firstName = document.getElementById('firstName').value;
  const errorFirstName = document.getElementById('firstNameErrorMsg');
  let firstNameReg = new RegExp(/^[a-zA-Z ]+$/);
  if (firstNameReg.test(firstName) === true) {
    errorFirstName.innerHTML = '';
    userContact.firstName = firstName;
    return userContact;
  } else {
    errorFirstName.innerHTML = 'Veuillez entrer un prénom valide.';
  }
}

/* Listener input firstName */
function firstNameListener() {
  const firstNameField = document.getElementById('firstName');
  firstNameField.addEventListener('change', validateFirstName);
}

/* Vérification input lastName */
function validateLastName() {
  const lastName = document.getElementById('lastName').value;
  const errorLastName = document.getElementById('lastNameErrorMsg');
  let lastNameReg = new RegExp(/^[a-zA-Z]+$/);
  if (lastNameReg.test(lastName) === true) {
    errorLastName.innerHTML = '';
    userContact.lastName = lastName;
    return userContact;
  } else {
    errorLastName.innerHTML = 'Veuillez entrer un nom valide.';
  }
}

/* Listener input lastName */
function lastNameListener() {
  const lastNameField = document.getElementById('lastName');
  lastNameField.addEventListener('change', validateLastName);
}


/* Vérification input address */
function validateAddress() {
  const address = document.getElementById('address').value;
  const errorAddress = document.getElementById('addressErrorMsg');
  let addressReg = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,}$/);
  if (addressReg.test(address) === true) {
    errorAddress.innerHTML = '';
    userContact.address = address;
    return userContact;
  } else {
    errorAddress.innerHTML = 'Veuillez entrer une adresse valide.';
  }
}

/* Listener input address */
function addressListener() {
  const addressField = document.getElementById('address');
  addressField.addEventListener('change', validateAddress);
}

/* Vérification input city */
function validateCity() {
  const city = document.getElementById('city').value;
  const errorCity = document.getElementById('cityErrorMsg');
  let cityReg = new RegExp(/^[a-zA-Z ]+$/);
  if (cityReg.test(city) === true) {
    errorCity.innerHTML = '';
    userContact.city = city;
    return userContact;
  } else {
    errorCity.innerHTML = 'Veuillez entrer une ville valide.';
  }
}

/* Listener input city */
function cityListener() {
  const cityField = document.getElementById('city');
  cityField.addEventListener('change', validateCity);
}

/* Vérification input email */
function validateEmail() {
  const email = document.getElementById('email').value;
  const errorEmail = document.getElementById('emailErrorMsg');
  let emailReg = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
  if (emailReg.test(email) === true) {
    errorEmail.innerHTML = '';
    userContact.email = email;
    return userContact;
  } else {
    errorEmail.innerHTML = 'Veuillez entrer une adresse email valide.';
  }
}

/* Listener input email */
function emailListener() {
  const emailField = document.getElementById('email');
  emailField.addEventListener('change', validateEmail);
}

/* All listener */
function allListener(){
  firstNameListener();
  lastNameListener();
  addressListener();
  cityListener();
  emailListener();
}

/* Display */
async function display() {
  let total = await insertProductsInCart();
  totalInsertion(total);
  updateItemButton();
  deleteItemButtons();
  allListener();
  postOrderButton();
}

display();