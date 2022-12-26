/* Récuperation de l'id du produit au sein de l'URL de la page */
function getOrderIdFromUrl() {
    const str = window.location.href;
    const url = new URL(str);
    return url.searchParams.get('orderId');
}

/* Affichage du numéro de commande */
function getCommandNumber() {
    orderId = getOrderIdFromUrl();
    orderIdDom = document.getElementById('orderId')
        .innerHTML = orderId;
}

/* Display */
function display() {
    getCommandNumber();
}

display();