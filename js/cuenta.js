// Funcionalidad de la página de cuenta
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está autenticado
  if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
    alert('Por favor, inicia sesión para acceder a tu cuenta');
    window.location.href = 'login.html';
    return;
  }

  const menuItems = document.querySelectorAll('.account-menu-item');
  const panels = document.querySelectorAll('.account-panel');

  // Formatear fecha del pedido
  function formatOrderDate(date) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month}, ${year}`;
  }

  // Determinar estado del pedido basado en la fecha
  function getOrderStatus(orderDate) {
    const now = new Date();
    const diffTime = now - orderDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      return 'delivered';
    } else if (diffDays >= 3) {
      return 'shipping';
    } else {
      return 'processing';
    }
  }

  // Obtener clase CSS del estado
  function getStatusClass(status) {
    return status; // 'delivered', 'shipping', 'processing'
  }

  // Obtener texto del estado
  function getStatusText(status) {
    const statusTexts = {
      'delivered': 'Entregado',
      'shipping': 'En Tránsito',
      'processing': 'Procesando'
    };
    return statusTexts[status] || 'Procesando';
  }

  // Cargar y mostrar pedidos
  function loadOrders() {
    const ordersList = document.querySelector('.orders-list');
    if (!ordersList) return;

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-shopping-bag" style="font-size: 64px; color: var(--text-light); margin-bottom: 20px;"></i>
          <p style="font-size: 18px; color: var(--text-light);">No tienes pedidos aún</p>
          <a href="productos.html" class="account-btn primary" style="margin-top: 20px; display: inline-block;">
            <i class="fas fa-shopping-bag"></i> Ver Productos
          </a>
        </div>
      `;
      return;
    }

    // Ordenar pedidos por fecha (más recientes primero)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersList.innerHTML = orders.map(order => {
      const orderDate = new Date(order.date);
      const formattedDate = formatOrderDate(orderDate);
      const status = getOrderStatus(orderDate);
      const statusClass = getStatusClass(status);
      const statusText = getStatusText(status);
      const itemsCount = order.items.length;
      const totalFormatted = order.total.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
      });

      return `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">Pedido #${order.id}</span>
              <span class="order-date">${formattedDate}</span>
            </div>
            <span class="order-status ${statusClass}">${statusText}</span>
          </div>
          <div class="order-items">
            <p>${itemsCount} producto${itemsCount !== 1 ? 's' : ''}</p>
            <p class="order-total">Total: ${totalFormatted}</p>
          </div>
          <button class="account-btn secondary" onclick="showOrderDetails(${order.id})">
            ${status === 'delivered' ? 'Ver Detalles' : status === 'shipping' ? 'Rastrear Pedido' : 'Ver Detalles'}
          </button>
        </div>
      `;
    }).join('');

    // Agregar event listeners a los botones de pedidos
    const orderButtons = document.querySelectorAll('.order-card .account-btn');
    orderButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const orderCard = this.closest('.order-card');
        const orderNumber = orderCard.querySelector('.order-number').textContent;
        const orderId = orderNumber.replace('Pedido #', '');
        showOrderDetails(parseInt(orderId));
      });
    });
  }

  // Mostrar detalles del pedido
  window.showOrderDetails = function(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      alert('Pedido no encontrado');
      return;
    }

    const orderDate = new Date(order.date);
    const formattedDate = formatOrderDate(orderDate);
    const itemsList = order.items.map(item => 
      `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`
    ).join('\n');

    const totalFormatted = order.total.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });

    const paymentMethodText = {
      'card': 'Tarjeta de Crédito/Débito',
      'transfer': 'Transferencia Bancaria',
      'cash': 'Pago Contra Entrega',
      'oxxo': 'Pago en OXXO'
    };

    alert(`DETALLES DEL PEDIDO #${order.id}

Fecha: ${formattedDate}
Estado: ${getStatusText(getOrderStatus(orderDate))}

DIRECCIÓN DE ENVÍO:
${order.shipping.firstName} ${order.shipping.lastName}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
Tel: ${order.shipping.phone}

PRODUCTOS:
${itemsList}

Método de Pago: ${paymentMethodText[order.payment.method] || order.payment.method}
Total: ${totalFormatted}`);
  };

  // Verificar si debe abrirse la sección de pedidos (desde confirmación de pedido)
  const shouldOpenOrders = sessionStorage.getItem('openOrdersSection');
  if (shouldOpenOrders === 'true') {
    sessionStorage.removeItem('openOrdersSection');
    // Remover clase active de todos los items y panels
    menuItems.forEach(mi => mi.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    
    // Activar sección de pedidos
    const ordersMenuItem = document.querySelector('.account-menu-item[data-section="orders"]');
    const ordersPanel = document.getElementById('orders-panel');
    if (ordersMenuItem && ordersPanel) {
      ordersMenuItem.classList.add('active');
      ordersPanel.classList.add('active');
      // Cargar pedidos inmediatamente
      setTimeout(() => {
        loadOrders();
      }, 100);
    }
  }

  // Función para cambiar de sección
  function switchSection(section) {
    // Remover clase active de todos los items y panels
    menuItems.forEach(mi => mi.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    // Agregar clase active al item seleccionado
    const targetMenuItem = document.querySelector(`.account-menu-item[data-section="${section}"]`);
    if (targetMenuItem) {
      targetMenuItem.classList.add('active');
    }

    // Mostrar el panel correspondiente
    const targetPanel = document.getElementById(`${section}-panel`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      
      // Si es la sección de pedidos, cargar los pedidos
      if (section === 'orders') {
        setTimeout(() => {
          loadOrders();
        }, 100);
      }
    }
  }

  // Manejar clics en el menú
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      
      // Si es cerrar sesión, mostrar confirmación
      if (section === 'logout') {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
          // Cerrar sesión usando AuthManager
          if (typeof AuthManager !== 'undefined') {
            AuthManager.logout();
          }
          alert('Sesión cerrada. Redirigiendo...');
          window.location.href = 'index.html';
        }
        return;
      }

      switchSection(section);
    });
  });

  // Manejar envío de formularios
  const forms = document.querySelectorAll('.account-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Cambios guardados correctamente');
    });
  });

  // Manejar botones de direcciones
  const editButtons = document.querySelectorAll('.address-btn.edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Funcionalidad de editar dirección (próximamente)');
    });
  });

  const deleteButtons = document.querySelectorAll('.address-btn.delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
        alert('Dirección eliminada');
      }
    });
  });

  // Botón agregar dirección
  const addAddressBtn = document.querySelector('.add-address');
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      alert('Funcionalidad de agregar dirección (próximamente)');
    });
  }

  // Cargar pedidos si la sección ya está activa al cargar la página
  if (document.getElementById('orders-panel')?.classList.contains('active')) {
    setTimeout(() => {
      loadOrders();
    }, 100);
  }

  // Botones de pedidos (mantener para compatibilidad)
  const orderButtons = document.querySelectorAll('.order-card .account-btn');
  orderButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const orderCard = this.closest('.order-card');
      const orderNumber = orderCard.querySelector('.order-number')?.textContent;
      if (orderNumber) {
        const orderId = orderNumber.replace('Pedido #', '');
        showOrderDetails(parseInt(orderId));
      }
    });
  });

  // Botones establecer dirección principal
  const setPrimaryButtons = document.querySelectorAll('.address-card .account-btn.secondary');
  setPrimaryButtons.forEach(btn => {
    if (btn.textContent.includes('Establecer')) {
      btn.addEventListener('click', () => {
        alert('Dirección establecida como principal');
      });
    }
  });
});

