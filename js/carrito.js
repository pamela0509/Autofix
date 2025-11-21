// Funcionalidad de la página del carrito
document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping');
  const discountElement = document.getElementById('discount');
  const totalElement = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Renderizar productos del carrito
  function renderCart() {
    const cart = CartManager.getCart();
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos desde nuestro catálogo</p>
          <button class="account-btn primary" onclick="window.location.href='productos.html'">
            <i class="fas fa-shopping-bag"></i>
            Ver Productos
          </button>
        </div>
      `;
      updateSummary(0, 0, 0);
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-product-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">$${item.price.toLocaleString('es-MX')} MXN</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" data-product-id="${item.id}">
            <i class="fas fa-minus"></i>
          </button>
          <input 
            type="number" 
            class="quantity-input" 
            value="${item.quantity}" 
            min="1" 
            data-product-id="${item.id}"
          />
          <button class="quantity-btn plus" data-product-id="${item.id}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="cart-item-total">
          <span class="item-total-price">$${(item.price * item.quantity).toLocaleString('es-MX')} MXN</span>
        </div>
        <button class="cart-item-remove" data-product-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    // Agregar event listeners
    setupCartEventListeners();
    updateSummary();
  }

  // Configurar event listeners del carrito
  function setupCartEventListeners() {
    // Botones de incrementar/decrementar cantidad
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        const newQuantity = parseInt(input.value) + 1;
        CartManager.updateQuantity(productId, newQuantity);
        renderCart();
      });
    });

    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        const newQuantity = Math.max(1, parseInt(input.value) - 1);
        CartManager.updateQuantity(productId, newQuantity);
        renderCart();
      });
    });

    // Inputs de cantidad
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', () => {
        const productId = parseInt(input.getAttribute('data-product-id'));
        const quantity = parseInt(input.value) || 1;
        CartManager.updateQuantity(productId, quantity);
        renderCart();
      });
    });

    // Botones de eliminar
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
          CartManager.removeProduct(productId);
          renderCart();
        }
      });
    });
  }

  // Actualizar resumen del carrito
  function updateSummary() {
    const cart = CartManager.getCart();
    const subtotal = CartManager.getTotalPrice();
    const shipping = subtotal >= 500 ? 0 : 150; // Envío gratis si es mayor a $500
    const discount = cart.length >= 3 ? subtotal * 0.1 : 0; // 10% descuento si hay 3+ productos
    const total = subtotal + shipping - discount;

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString('es-MX')} MXN`;
    if (shippingElement) {
      shippingElement.textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString('es-MX')} MXN`;
      shippingElement.style.color = shipping === 0 ? '#2e7d32' : 'inherit';
    }
    if (discountElement) {
      discountElement.textContent = discount > 0 ? `-$${discount.toLocaleString('es-MX')} MXN` : '$0.00 MXN';
      discountElement.style.color = discount > 0 ? '#2e7d32' : 'inherit';
    }
    if (totalElement) totalElement.textContent = `$${total.toLocaleString('es-MX')} MXN`;
  }

  // Botón de checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const cart = CartManager.getCart();
      if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
      }

      // Verificar si el usuario está autenticado
      if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
        if (confirm('Para proceder al pago necesitas iniciar sesión. ¿Deseas iniciar sesión ahora?')) {
          window.location.href = 'login.html';
        }
        return;
      }

      // Redirigir a la página de pago
      window.location.href = 'pago.html';
    });
  }

  // Renderizar carrito inicial
  renderCart();
});

