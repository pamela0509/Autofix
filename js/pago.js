// Funcionalidad de la página de checkout/pago
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el carrito no esté vacío
  const cart = CartManager.getCart();
  if (cart.length === 0) {
    alert('Tu carrito está vacío. Serás redirigido al catálogo.');
    window.location.href = 'productos.html';
    return;
  }

  // Elementos del DOM
  const shippingStep = document.getElementById('shippingStep');
  const paymentStep = document.getElementById('paymentStep');
  const continueToPaymentBtn = document.getElementById('continueToPayment');
  const backToShippingBtn = document.getElementById('backToShipping');
  const confirmOrderBtn = document.getElementById('confirmOrder');
  const shippingForm = document.getElementById('shippingForm');
  const paymentForm = document.getElementById('paymentForm');
  const orderItemsContainer = document.getElementById('orderItems');
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('cardDetails');
  const transferDetails = document.getElementById('transferDetails');
  const cashDetails = document.getElementById('cashDetails');
  const oxxoDetails = document.getElementById('oxxoDetails');

  // Renderizar resumen del pedido
  function renderOrderSummary() {
    const cart = CartManager.getCart();
    const subtotal = CartManager.getTotalPrice();
    const shipping = subtotal >= 500 ? 0 : 150;
    const discount = cart.length >= 3 ? subtotal * 0.1 : 0;
    const total = subtotal + shipping - discount;

    // Renderizar productos
    orderItemsContainer.innerHTML = cart.map(item => `
      <div class="order-item">
        <div class="order-item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="order-item-info">
          <h4 class="order-item-name">${item.name}</h4>
          <p class="order-item-quantity">Cantidad: ${item.quantity}</p>
          <p class="order-item-price">$${(item.price * item.quantity).toLocaleString('es-MX')} MXN</p>
        </div>
      </div>
    `).join('');

    // Actualizar totales
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toLocaleString('es-MX')} MXN`;
    
    const shippingElement = document.getElementById('summaryShipping');
    shippingElement.textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString('es-MX')} MXN`;
    shippingElement.style.color = shipping === 0 ? '#2e7d32' : 'inherit';
    
    const discountElement = document.getElementById('summaryDiscount');
    discountElement.textContent = discount > 0 ? `-$${discount.toLocaleString('es-MX')} MXN` : '$0.00 MXN';
    discountElement.style.color = discount > 0 ? '#2e7d32' : 'inherit';
    
    document.getElementById('summaryTotal').textContent = `$${total.toLocaleString('es-MX')} MXN`;
  }

  // Validar formulario de envío
  function validateShippingForm() {
    const requiredFields = shippingForm.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = '#ea4335';
      } else {
        field.style.borderColor = '';
      }
    });

    // Validar formato de email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
      isValid = false;
      email.style.borderColor = '#ea4335';
      alert('Por favor, ingresa un correo electrónico válido.');
    }

    // Validar código postal
    const zipCode = document.getElementById('zipCode');
    if (zipCode.value && !/^[0-9]{5}$/.test(zipCode.value)) {
      isValid = false;
      zipCode.style.borderColor = '#ea4335';
      alert('El código postal debe tener 5 dígitos.');
    }

    return isValid;
  }

  // Validar formulario de pago
  function validatePaymentForm() {
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (selectedPayment === 'card') {
      const cardNumber = document.getElementById('cardNumber');
      const cardExpiry = document.getElementById('cardExpiry');
      const cardCVC = document.getElementById('cardCVC');
      const cardName = document.getElementById('cardName');

      let isValid = true;

      if (!cardNumber.value.trim() || cardNumber.value.replace(/\s/g, '').length < 13) {
        isValid = false;
        cardNumber.style.borderColor = '#ea4335';
      } else {
        cardNumber.style.borderColor = '';
      }

      if (!cardExpiry.value.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry.value)) {
        isValid = false;
        cardExpiry.style.borderColor = '#ea4335';
      } else {
        cardExpiry.style.borderColor = '';
      }

      if (!cardCVC.value.trim() || cardCVC.value.length < 3) {
        isValid = false;
        cardCVC.style.borderColor = '#ea4335';
      } else {
        cardCVC.style.borderColor = '';
      }

      if (!cardName.value.trim()) {
        isValid = false;
        cardName.style.borderColor = '#ea4335';
      } else {
        cardName.style.borderColor = '';
      }

      if (!isValid) {
        alert('Por favor, completa todos los campos de la tarjeta correctamente.');
      }

      return isValid;
    }

    // Para transferencia o efectivo, no se requieren validaciones adicionales
    return true;
  }

  // Formatear número de tarjeta
  function formatCardNumber(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  }

  // Formatear fecha de expiración
  function formatExpiry(value) {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  }

  // Cambiar a paso de pago
  continueToPaymentBtn.addEventListener('click', () => {
    if (validateShippingForm()) {
      shippingStep.style.display = 'none';
      paymentStep.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Volver a paso de envío
  backToShippingBtn.addEventListener('click', () => {
    paymentStep.style.display = 'none';
    shippingStep.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Cambiar método de pago
  function updatePaymentDetails() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    cardDetails.style.display = selectedMethod === 'card' ? 'block' : 'none';
    transferDetails.style.display = selectedMethod === 'transfer' ? 'block' : 'none';
    cashDetails.style.display = selectedMethod === 'cash' ? 'block' : 'none';
    oxxoDetails.style.display = selectedMethod === 'oxxo' ? 'block' : 'none';

    // Actualizar clases de los métodos de pago
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.classList.remove('selected');
    });
    const selectedCard = document.querySelector(`input[name="paymentMethod"][value="${selectedMethod}"]`).closest('.payment-method-card');
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
  }

  paymentMethods.forEach(method => {
    method.addEventListener('change', updatePaymentDetails);
  });

  // Inicializar método de pago por defecto
  updatePaymentDetails();

  // Formatear inputs de tarjeta
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      e.target.value = formatCardNumber(e.target.value);
    });
  }

  const cardExpiryInput = document.getElementById('cardExpiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      e.target.value = formatExpiry(e.target.value);
    });
  }

  const cardCVCInput = document.getElementById('cardCVC');
  if (cardCVCInput) {
    cardCVCInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  // Confirmar pedido
  confirmOrderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }

    // Mostrar confirmación
    if (confirm('¿Estás seguro de que deseas confirmar tu pedido?')) {
      // Guardar información del pedido (en una app real, se enviaría al servidor)
      const shippingData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        references: document.getElementById('references').value
      };

      const paymentData = {
        method: document.querySelector('input[name="paymentMethod"]:checked').value,
        cardNumber: document.getElementById('cardNumber')?.value || '',
        cardExpiry: document.getElementById('cardExpiry')?.value || '',
        cardCVC: document.getElementById('cardCVC')?.value || '',
        cardName: document.getElementById('cardName')?.value || ''
      };

      const orderData = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: CartManager.getCart(),
        shipping: shippingData,
        payment: paymentData,
        total: calculateTotal()
      };

      // Guardar pedido en localStorage (en una app real, se enviaría al servidor)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Limpiar carrito
      CartManager.clearCart();

      // Redirigir a la página de cuenta, sección de pedidos
      alert('¡Pedido confirmado! Tu número de pedido es: #' + orderData.id + '\n\nSerás redirigido a "Mis Pedidos" para ver el detalle.');
      // Guardar indicador para abrir la sección de pedidos al cargar la página
      sessionStorage.setItem('openOrdersSection', 'true');
      window.location.href = 'cuenta.html';
    }
  });

  // Calcular total
  function calculateTotal() {
    const cart = CartManager.getCart();
    const subtotal = CartManager.getTotalPrice();
    const shipping = subtotal >= 500 ? 0 : 150;
    const discount = cart.length >= 3 ? subtotal * 0.1 : 0;
    return subtotal + shipping - discount;
  }

  // Renderizar resumen inicial
  renderOrderSummary();

  // Actualizar badge del carrito
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
});

