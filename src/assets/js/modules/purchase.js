'use strict';

const purchaseModule = (function() {
  const STORAGE_KEY = 'xm_purchase_state';
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function getDefaults() {
    const source = typeof purchaseData !== 'undefined' ? purchaseData : {};
    return {
      suppliers: clone(source.suppliers || []),
      orders: clone(source.orders || []),
      analysis: clone(source.analysis || { monthly: [] })
    };
  }

  function loadState() {
    const defaults = getDefaults();
    const stored = typeof storage !== 'undefined' && typeof storage.get === 'function'
      ? storage.get(STORAGE_KEY)
      : null;

    return {
      suppliers: Array.isArray(stored && stored.suppliers) ? stored.suppliers : defaults.suppliers,
      orders: Array.isArray(stored && stored.orders) ? stored.orders : defaults.orders,
      analysis: stored && stored.analysis ? stored.analysis : defaults.analysis
    };
  }

  function syncState() {
    state = loadState();
    return state;
  }

  function persist() {
    if (typeof storage !== 'undefined' && typeof storage.set === 'function') {
      storage.set(STORAGE_KEY, state);
    }
  }

  function setHtml(id, html) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = html;
    }
  }

  function nextId(prefix, list) {
    const maxId = list.reduce((max, item) => {
      const match = String(item.id || '').match(/(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0);
    return prefix + String(maxId + 1).padStart(3, '0');
  }

  function pageName() {
    return window.location.pathname.split('/').pop() || '';
  }

  function createSupplier(payload) {
    state = syncState();
    const item = {
      id: nextId('S', state.suppliers),
      name: payload.name,
      contact: payload.contact || '待定',
      phone: payload.phone || '',
      category: payload.category || '原材料',
      rating: Number(payload.rating) || 3,
      status: payload.status || '合作中'
    };

    state.suppliers.push(item);
    persist();
    return item;
  }

  function deleteSupplier(id) {
    state = syncState();
    state.suppliers = state.suppliers.filter((item) => item.id !== id);
    persist();
  }

  function createOrder(payload) {
    state = syncState();
    const quantity = Number(payload.quantity) || 0;
    const unitPrice = Number(payload.unitPrice) || 0;
    const item = {
      id: nextId('PUR', state.orders),
      supplierId: payload.supplierId || '',
      supplierName: payload.supplierName,
      item: payload.item,
      quantity,
      unit: payload.unit || '件',
      unitPrice,
      amount: quantity * unitPrice,
      status: payload.status || '待审核',
      createDate: payload.createDate || '2026-04-19',
      deliveryDate: payload.deliveryDate || '2026-05-05'
    };

    state.orders.push(item);
    persist();
    return item;
  }

  function initIndexPage() {
    const tbody = document.getElementById('order-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const data = syncState();
    const totalAmount = data.orders.reduce((sum, item) => sum + item.amount, 0);
    const delivered = data.orders.filter((item) => item.status === '已到货').length;
    const activeSuppliers = data.suppliers.filter((item) => item.status === '合作中').length;
    const statusMap = { 已到货: 'badge-success', 运输中: 'badge-info', 待发货: 'badge-warning', 待审核: 'badge-default' };

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">🤝</div><div class="stat-info"><div class="stat-value">${activeSuppliers}</div><div class="stat-label">合作供应商</div></div></div>
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${data.orders.length}</div><div class="stat-label">采购订单</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAmount)}</div><div class="stat-label">采购总额</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${delivered}</div><div class="stat-label">已到货</div></div></div>
    `);

    tbody.innerHTML = data.orders.map((item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.supplierName}</td>
        <td><strong>${item.item}</strong></td>
        <td><strong>${formatMoney(item.amount)}</strong></td>
        <td>${item.deliveryDate}</td>
        <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `).join('');

    tbody.dataset.bound = '1';
  }

  function initSupplierPage() {
    const tbody = document.getElementById('supplier-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    function renderStars(rating) {
      return '⭐'.repeat(rating) + '<span style="color:var(--color-text-secondary)">' + '☆'.repeat(5 - rating) + '</span>';
    }

    function render(list) {
      const active = syncState().suppliers.filter((item) => item.status === '合作中').length;
      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">🤝</div><div class="stat-info"><div class="stat-value">${syncState().suppliers.length}</div><div class="stat-label">供应商总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${active}</div><div class="stat-label">合作中</div></div></div>
        <div class="stat-card"><div class="stat-icon">⏸️</div><div class="stat-info"><div class="stat-value">${syncState().suppliers.length - active}</div><div class="stat-label">已暂停</div></div></div>
      `);

      const statusMap = { 合作中: 'badge-success', 暂停: 'badge-warning' };
      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.contact}</td>
          <td>${item.phone}</td>
          <td>${item.category}</td>
          <td>${renderStars(item.rating)}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td><div class="table-actions"><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></div></td>
        </tr>
      `).join('');
    }

    function refresh() {
      const keyword = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
      const list = syncState().suppliers.filter((item) => {
        const text = `${item.name} ${item.contact}`.toLowerCase();
        return !keyword || text.includes(keyword);
      });
      render(list);
    }

    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const name = window.prompt('供应商名称');
      if (!name) {
        return;
      }
      createSupplier({
        name,
        contact: window.prompt('联系人', '采购经理') || '采购经理',
        phone: window.prompt('联系电话', '13700009999') || '13700009999',
        category: window.prompt('品类', '原材料') || '原材料',
        rating: window.prompt('评级（1-5）', '4') || '4',
        status: window.prompt('状态（合作中/暂停）', '合作中') || '合作中'
      });
      refresh();
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该供应商？')) {
        deleteSupplier(this.dataset.id);
        refresh();
      }
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initProcessPage() {
    const tbody = document.getElementById('order-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 已到货: 'badge-success', 运输中: 'badge-info', 待发货: 'badge-warning', 待审核: 'badge-default' };

    function render(list) {
      const totalAmount = syncState().orders.reduce((sum, item) => sum + item.amount, 0);
      const delivered = syncState().orders.filter((item) => item.status === '已到货').length;

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${syncState().orders.length}</div><div class="stat-label">订单总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAmount)}</div><div class="stat-label">采购总额</div></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${delivered}</div><div class="stat-label">已到货</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.supplierName}</td>
          <td><strong>${item.item}</strong></td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${formatMoney(item.unitPrice)}</td>
          <td><strong>${formatMoney(item.amount)}</strong></td>
          <td>${item.createDate}</td>
          <td>${item.deliveryDate}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        </tr>
      `).join('');
    }

    function refresh() {
      const keyword = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
      const status = (document.getElementById('status-filter') || {}).value || '';
      const list = syncState().orders.filter((item) => {
        const text = `${item.supplierName} ${item.item}`.toLowerCase();
        return (!keyword || text.includes(keyword)) && (!status || item.status === status);
      });
      render(list);
    }

    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('status-filter'), 'change', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const supplierName = window.prompt('供应商名称');
      const item = window.prompt('采购物料');
      if (!supplierName || !item) {
        return;
      }
      createOrder({
        supplierName,
        item,
        quantity: window.prompt('数量', '10') || '10',
        unit: window.prompt('单位', '吨') || '吨',
        unitPrice: window.prompt('单价', '1000') || '1000',
        status: window.prompt('状态（待审核/待发货/运输中/已到货）', '待审核') || '待审核'
      });
      refresh();
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initTrackingPage() {
    const tbody = document.getElementById('tracking-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const orders = syncState().orders;
    const statusMap = { 已到货: 'badge-success', 运输中: 'badge-info', 待发货: 'badge-warning', 待审核: 'badge-default' };
    const today = new Date();
    const inTransit = orders.filter((item) => item.status === '运输中').length;
    const pending = orders.filter((item) => item.status === '待发货' || item.status === '待审核').length;
    const delivered = orders.filter((item) => item.status === '已到货').length;

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">🚚</div><div class="stat-info"><div class="stat-value">${inTransit}</div><div class="stat-label">运输中</div></div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><div class="stat-value">${pending}</div><div class="stat-label">待发货/待审核</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${delivered}</div><div class="stat-label">已到货</div></div></div>
    `);

    tbody.innerHTML = orders.map((item) => {
      const deliveryDate = new Date(item.deliveryDate);
      const daysLeft = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
      const daysDisplay = item.status === '已到货'
        ? '—'
        : daysLeft < 0
          ? `<span style="color:var(--color-danger);font-weight:600">已逾期 ${Math.abs(daysLeft)} 天</span>`
          : daysLeft <= 3
            ? `<span style="color:var(--color-warning);font-weight:600">${daysLeft} 天</span>`
            : `${daysLeft} 天`;
      return `
        <tr>
          <td>${item.id}</td>
          <td>${item.supplierName}</td>
          <td><strong>${item.item}</strong></td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${item.deliveryDate}</td>
          <td>${daysDisplay}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        </tr>
      `;
    }).join('');

    tbody.dataset.bound = '1';
  }

  function initAnalysisPage() {
    const analysisBody = document.getElementById('analysis-tbody');
    const supplierBody = document.getElementById('supplier-tbody');
    if (!analysisBody || !supplierBody || analysisBody.dataset.bound === '1') {
      return;
    }

    const monthly = syncState().analysis.monthly || [];
    const totalAmount = monthly.reduce((sum, item) => sum + item.amount, 0);
    const totalOrders = monthly.reduce((sum, item) => sum + item.orders, 0);
    const maxAmount = Math.max.apply(null, monthly.map((item) => item.amount).concat([0]));
    const avgAmount = monthly.length ? Math.round(totalAmount / monthly.length) : 0;

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAmount)}</div><div class="stat-label">6个月采购总额</div></div></div>
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${totalOrders}</div><div class="stat-label">6个月总订单数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value">${formatMoney(maxAmount)}</div><div class="stat-label">单月最高采购额</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">${formatMoney(avgAmount)}</div><div class="stat-label">月均采购额</div></div></div>
    `);

    analysisBody.innerHTML = monthly.map((item) => {
      const barWidth = maxAmount ? Math.round((item.amount / maxAmount) * 100) : 0;
      return `
        <tr>
          <td>${item.month}</td>
          <td><strong>${formatMoney(item.amount)}</strong></td>
          <td>${item.orders}</td>
          <td>${barWidth}%</td>
        </tr>
      `;
    }).join('');

    const supplierMap = {};
    syncState().orders.forEach((item) => {
      supplierMap[item.supplierName] = (supplierMap[item.supplierName] || 0) + item.amount;
    });
    const supplierTotal = Object.values(supplierMap).reduce((sum, value) => sum + value, 0);
    supplierBody.innerHTML = Object.entries(supplierMap).sort((a, b) => b[1] - a[1]).map(([name, amount]) => {
      const percent = supplierTotal ? ((amount / supplierTotal) * 100).toFixed(1) : '0.0';
      return `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${formatMoney(amount)}</td>
          <td>${percent}%</td>
        </tr>
      `;
    }).join('');

    analysisBody.dataset.bound = '1';
  }

  function init() {
    try {
      switch (pageName()) {
        case 'index.html':
          if (document.getElementById('order-tbody')) {
            initIndexPage();
          }
          break;
        case 'supplier.html':
          initSupplierPage();
          break;
        case 'process.html':
          initProcessPage();
          break;
        case 'tracking.html':
          initTrackingPage();
          break;
        case 'analysis.html':
          initAnalysisPage();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('purchaseModule.init failed:', error);
    }
  }

  return {
    init,
    getState() {
      return clone(syncState());
    },
    createSupplier,
    deleteSupplier,
    createOrder
  };
})();

window.purchaseModule = purchaseModule;
document.addEventListener('DOMContentLoaded', () => purchaseModule.init());
