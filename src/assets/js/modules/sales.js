'use strict';

const salesModule = (function() {
  const STORAGE_KEY = 'xm_sales_state';
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function getDefaults() {
    const source = typeof salesData !== 'undefined' ? salesData : {};
    return {
      customers: clone(source.customers || []),
      orders: clone(source.orders || []),
      report: clone(source.report || { monthly: [] }),
      pricing: clone(source.pricing || []),
      team: clone(source.team || [])
    };
  }

  function loadState() {
    const defaults = getDefaults();
    const stored = typeof storage !== 'undefined' && typeof storage.get === 'function'
      ? storage.get(STORAGE_KEY)
      : null;

    return {
      customers: Array.isArray(stored && stored.customers) ? stored.customers : defaults.customers,
      orders: Array.isArray(stored && stored.orders) ? stored.orders : defaults.orders,
      report: stored && stored.report ? stored.report : defaults.report,
      pricing: Array.isArray(stored && stored.pricing) ? stored.pricing : defaults.pricing,
      team: Array.isArray(stored && stored.team) ? stored.team : defaults.team
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

  function createCustomer(payload) {
    state = syncState();
    const item = {
      id: nextId('C', state.customers),
      name: payload.name,
      contact: payload.contact || '待定',
      phone: payload.phone || '',
      email: payload.email || '',
      city: payload.city || '北京',
      level: payload.level || '普通',
      totalAmount: Number(payload.totalAmount) || 0
    };

    state.customers.push(item);
    persist();
    return item;
  }

  function deleteCustomer(id) {
    state = syncState();
    state.customers = state.customers.filter((item) => item.id !== id);
    persist();
  }

  function createOrder(payload) {
    state = syncState();
    const quantity = Number(payload.quantity) || 0;
    const unitPrice = Number(payload.unitPrice) || 0;
    const item = {
      id: nextId('SO', state.orders),
      customerId: payload.customerId || '',
      customerName: payload.customerName,
      product: payload.product,
      quantity,
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

  function createPricing(payload) {
    state = syncState();
    const standardPrice = Number(payload.standardPrice) || 0;
    const currentPrice = Number(payload.currentPrice) || standardPrice;
    const item = {
      id: nextId('PR', state.pricing),
      product: payload.product,
      standardPrice,
      currentPrice,
      discount: standardPrice ? Number((currentPrice / standardPrice).toFixed(2)) : 1,
      validFrom: payload.validFrom || '2026-04-19',
      validTo: payload.validTo || '2026-12-31',
      status: payload.status || '生效中'
    };

    state.pricing.push(item);
    persist();
    return item;
  }

  function initIndexPage() {
    const tbody = document.getElementById('order-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const data = syncState();
    const totalRevenue = data.orders.reduce((sum, item) => sum + item.amount, 0);
    const done = data.orders.filter((item) => item.status === '已完成').length;
    const vip = data.customers.filter((item) => item.level === 'VIP').length;
    const statusMap = { 已完成: 'badge-success', 配送中: 'badge-info', 待发货: 'badge-warning', 待审核: 'badge-default' };

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalRevenue)}</div><div class="stat-label">本月销售额</div></div></div>
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${data.orders.length}</div><div class="stat-label">订单总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${done}</div><div class="stat-label">已完成订单</div></div></div>
      <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-info"><div class="stat-value">${vip}</div><div class="stat-label">VIP客户</div></div></div>
    `);

    tbody.innerHTML = data.orders.slice(0, 5).map((item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.customerName}</td>
        <td>${item.product}</td>
        <td><strong>${formatMoney(item.amount)}</strong></td>
        <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `).join('');

    tbody.dataset.bound = '1';
  }

  function initCustomerPage() {
    const tbody = document.getElementById('customer-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const levelMap = { VIP: 'badge-danger', 重要: 'badge-warning', 普通: 'badge-default' };

    function render(list) {
      const customers = syncState().customers;
      const vip = customers.filter((item) => item.level === 'VIP').length;
      const totalAmount = customers.reduce((sum, item) => sum + item.totalAmount, 0);

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">🤝</div><div class="stat-info"><div class="stat-value">${customers.length}</div><div class="stat-label">客户总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-info"><div class="stat-value">${vip}</div><div class="stat-label">VIP客户</div></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAmount)}</div><div class="stat-label">累计销售额</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.contact}</td>
          <td>${item.phone}</td>
          <td>${item.city}</td>
          <td><span class="badge ${levelMap[item.level] || 'badge-default'}">${item.level}</span></td>
          <td>${formatMoney(item.totalAmount)}</td>
          <td><div class="table-actions"><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></div></td>
        </tr>
      `).join('');
    }

    function refresh() {
      const keyword = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
      const list = syncState().customers.filter((item) => {
        const text = `${item.name} ${item.contact}`.toLowerCase();
        return !keyword || text.includes(keyword);
      });
      render(list);
    }

    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const name = window.prompt('客户名称');
      if (!name) {
        return;
      }
      createCustomer({
        name,
        contact: window.prompt('联系人', '销售负责人') || '销售负责人',
        phone: window.prompt('联系电话', '13900009999') || '13900009999',
        city: window.prompt('所在城市', '北京') || '北京',
        level: window.prompt('客户等级（VIP/重要/普通）', '普通') || '普通'
      });
      refresh();
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该客户？')) {
        deleteCustomer(this.dataset.id);
        refresh();
      }
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initOrderPage() {
    const tbody = document.getElementById('order-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 已完成: 'badge-success', 配送中: 'badge-info', 待发货: 'badge-warning', 待审核: 'badge-default' };

    function render(list) {
      const orders = syncState().orders;
      const totalAmount = orders.reduce((sum, item) => sum + item.amount, 0);
      const done = orders.filter((item) => item.status === '已完成').length;

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${orders.length}</div><div class="stat-label">订单总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAmount)}</div><div class="stat-label">订单总额</div></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${done}</div><div class="stat-label">已完成</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.customerName}</td>
          <td><strong>${item.product}</strong></td>
          <td>${item.quantity}</td>
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
        const text = `${item.customerName} ${item.product}`.toLowerCase();
        return (!keyword || text.includes(keyword)) && (!status || item.status === status);
      });
      render(list);
    }

    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('status-filter'), 'change', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const customerName = window.prompt('客户名称');
      const product = window.prompt('产品名称');
      if (!customerName || !product) {
        return;
      }
      createOrder({
        customerName,
        product,
        quantity: window.prompt('数量', '10') || '10',
        unitPrice: window.prompt('单价', '1000') || '1000',
        status: window.prompt('状态（待审核/待发货/配送中/已完成）', '待审核') || '待审核'
      });
      refresh();
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initPricingPage() {
    const tbody = document.getElementById('pricing-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    function render() {
      tbody.innerHTML = syncState().pricing.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.product}</strong></td>
          <td>${formatMoney(item.standardPrice)}</td>
          <td><strong style="color:var(--color-primary)">${formatMoney(item.currentPrice)}</strong></td>
          <td>${item.discount < 1 ? `<span class="badge badge-warning">${(item.discount * 10).toFixed(1)}折</span>` : '—'}</td>
          <td>${item.validFrom} ~ ${item.validTo}</td>
          <td><span class="badge badge-success">${item.status}</span></td>
        </tr>
      `).join('');
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const product = window.prompt('产品名称');
      if (!product) {
        return;
      }
      createPricing({
        product,
        standardPrice: window.prompt('标准价', '1000') || '1000',
        currentPrice: window.prompt('执行价', '900') || '900'
      });
      render();
    });

    tbody.dataset.bound = '1';
    render();
  }

  function initReportPage() {
    const tbody = document.getElementById('report-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const monthly = syncState().report.monthly || [];
    const totalRevenue = monthly.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = monthly.reduce((sum, item) => sum + item.orders, 0);
    const maxRevenue = Math.max.apply(null, monthly.map((item) => item.revenue).concat([0]));

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalRevenue)}</div><div class="stat-label">6个月总销售额</div></div></div>
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${totalOrders}</div><div class="stat-label">6个月总订单数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value">${formatMoney(maxRevenue)}</div><div class="stat-label">单月最高销售额</div></div></div>
    `);

    tbody.innerHTML = monthly.map((item) => {
      const barWidth = maxRevenue ? Math.round((item.revenue / maxRevenue) * 100) : 0;
      return `
        <tr>
          <td>${item.month}</td>
          <td><strong>${formatMoney(item.revenue)}</strong></td>
          <td>${item.orders}</td>
          <td>${item.newCustomers}</td>
          <td>${barWidth}%</td>
        </tr>
      `;
    }).join('');

    tbody.dataset.bound = '1';
  }

  function initTeamPage() {
    const tbody = document.getElementById('team-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const team = syncState().team;
    const totalTarget = team.reduce((sum, item) => sum + item.target, 0);
    const totalAchieved = team.reduce((sum, item) => sum + item.achieved, 0);
    const avgRate = totalTarget ? ((totalAchieved / totalTarget) * 100).toFixed(1) : '0.0';

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">${team.length}</div><div class="stat-label">团队人数</div></div></div>
      <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-info"><div class="stat-value">${formatMoney(totalTarget)}</div><div class="stat-label">团队目标</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalAchieved)}</div><div class="stat-label">已完成</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">${avgRate}%</div><div class="stat-label">平均完成率</div></div></div>
    `);

    tbody.innerHTML = team.map((item) => {
      const rate = (item.rate * 100).toFixed(1);
      return `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.role}</td>
          <td>${item.region}</td>
          <td>${formatMoney(item.target)}</td>
          <td>${formatMoney(item.achieved)}</td>
          <td>${rate}%</td>
        </tr>
      `;
    }).join('');

    tbody.dataset.bound = '1';
  }

  function init() {
    try {
      switch (pageName()) {
        case 'index.html':
          if (document.getElementById('order-tbody')) {
            initIndexPage();
          }
          break;
        case 'customer.html':
          initCustomerPage();
          break;
        case 'order.html':
          initOrderPage();
          break;
        case 'pricing.html':
          initPricingPage();
          break;
        case 'report.html':
          initReportPage();
          break;
        case 'team.html':
          initTeamPage();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('salesModule.init failed:', error);
    }
  }

  return {
    init,
    getState() {
      return clone(syncState());
    },
    createCustomer,
    deleteCustomer,
    createOrder,
    createPricing
  };
})();

window.salesModule = salesModule;
document.addEventListener('DOMContentLoaded', () => salesModule.init());
