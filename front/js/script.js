/* Récuperation des produits auprès de l'API */
async function getAllProducts() {
    return fetch('http://localhost:3000/api/products')
        .then((response) => response.json())
        .catch((error) => console.log(error));
}

/* Création du format HTML d'un produit */
function formatProduct(items, product) {
/* Insertion du lien */
   const link = document.createElement('a');
   items.appendChild(link);
   const href = './product.html?id=';
   const linkAdress = href + product._id;
   link.setAttribute('href', linkAdress);
/* Insertion de l'article */
   const article = document.createElement('article');
   link.appendChild(article);
/* Insertion de l'image */
   const image = document.createElement('img');
   article.appendChild(image);
   image.setAttribute('src', product.imageUrl);
   image.setAttribute('alt', product.altTxt);
/* Insertion du titre */
   const h3 = document.createElement('h3');
   article.appendChild(h3);
   h3.setAttribute('class', 'productName');
   h3.setAttribute('id', 'pro');
   h3.innerHTML = product.name;
/* Insertion de la description */
   const p = document.createElement('p');
   article.appendChild(p);
   p.setAttribute('class', 'productDescription');
   p.innerHTML = product.description;
}

/* Intégration des produits au sein de la page HTML*/
function insertProducts(products) {
   const items = document.querySelector('#items');
    for (let product = 0; product < products.length; product++) {
        formatProduct(items, products[product]);
    }
}

/* Display */
async function display() {
    const products = await getAllProducts();
    insertProducts(products);
}

display();