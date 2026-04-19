'use strict';

const equipmentModule = (function() {
  const STORAGE_KEY = 'xm_equipment_state';
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function getDefaults() {
    const source = typeof equipmentData !== 'undefined' ? equipmentData : {};
    return {
      equipment: clone(source.equipment || []),
      maintenance: clone(source.maintenance || []),
      faults: clone(source.faults || [])
    };
  }

  function loadState() {
    const defaults = getDefaults();
    const stored = typeof storage !== 'undefined' && typeof storage.get === 'function'
      ? storage.get(STORAGE_KEY)
      : null;

    return {
      equipment: Array.isArray(stored && stored.equipment) ? stored.equipment : defaults.equipment,
      maintenance: Array.isArray(stored && stored.maintenance) ? stored.maintenance : defaults.maintenance,
      faults: Array.isArray(stored && stored.faults) ? stored.faults : defaults.faults
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

  function createEquipment(payload) {
    state = syncState();
    const item = {
      id: nextId('EQ', state.equipment),
      name: payload.name,
      model: payload.model || 'NEW-100',
      location: payload.location || '新车间',
      status: payload.status || '运行中',
      purchaseDate: payload.purchaseDate || '2026-04-19',
      lastMaintain: payload.lastMaintain || '2026-04-19',
      nextMaintain: payload.nextMaintain || '2026-07-19'
    };

    state.equipment.push(item);
    persist();
    return item;
  }

  function deleteEquipment(id) {
    state = syncState();
    state.equipment = state.equipment.filter((item) => item.id !== id);
    persist();
  }

  function createMaintenance(payload) {
    state = syncState();
    const item = {
      id: nextId('MT', state.maintenance),
      equipId: payload.equipId || '',
      equipName: payload.equipName,
      type: payload.type || '定期保养',
      planDate: payload.planDate || '2026-05-01',
      status: payload.status || '待执行',
      technician: payload.technician || '张工',
      cost: Number(payload.cost) || 0
    };

    state.maintenance.push(item);
    persist();
    return item;
  }

  function deleteMaintenance(id) {
    state = syncState();
    state.maintenance = state.maintenance.filter((item) => item.id !== id);
    persist();
  }

  function createFault(payload) {
    state = syncState();
    const item = {
      id: nextId('FT', state.faults),
      equipId: payload.equipId || '',
      equipName: payload.equipName,
      faultDate: payload.faultDate || '2026-04-19',
      description: payload.description || '待补充',
      severity: payload.severity || '一般',
      status: payload.status || '待处理',
      handler: payload.handler || '张工'
    };

    state.faults.push(item);
    persist();
    return item;
  }

  function deleteFault(id) {
    state = syncState();
    state.faults = state.faults.filter((item) => item.id !== id);
    persist();
  }

  function initIndexPage() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const data = syncState();
    const running = data.equipment.filter((item) => item.status === '运行中').length;
    const repairing = data.equipment.filter((item) => item.status === '维修中').length;
    const pendingFaults = data.faults.filter((item) => item.status !== '已解决').length;
    const statusMap = { 运行中: 'badge-success', 维修中: 'badge-warning', 停机: 'badge-danger' };

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">🏭</div><div class="stat-info"><div class="stat-value">${data.equipment.length}</div><div class="stat-label">设备总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${running}</div><div class="stat-label">运行中</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔧</div><div class="stat-info"><div class="stat-value">${repairing}</div><div class="stat-label">维修中</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-info"><div class="stat-value">${pendingFaults}</div><div class="stat-label">待处理故障</div></div></div>
    `);

    tbody.innerHTML = data.equipment.map((item) => `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.model}</td>
        <td>${item.location}</td>
        <td>${item.nextMaintain}</td>
        <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `).join('');

    tbody.dataset.bound = '1';
  }

  function initMonitorPage() {
    const tbody = document.getElementById('monitor-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const list = syncState().equipment;
    const running = list.filter((item) => item.status === '运行中').length;
    const repairing = list.filter((item) => item.status === '维修中').length;
    const stopped = list.filter((item) => item.status === '停机').length;
    const statusMap = { 运行中: 'badge-success', 维修中: 'badge-warning', 停机: 'badge-danger' };

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">🏭</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">设备总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${running}</div><div class="stat-label">运行中</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔧</div><div class="stat-info"><div class="stat-value">${repairing}</div><div class="stat-label">维修中</div></div></div>
      <div class="stat-card"><div class="stat-icon">🛑</div><div class="stat-info"><div class="stat-value">${stopped}</div><div class="stat-label">停机</div></div></div>
    `);

    tbody.innerHTML = list.map((item) => `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.model}</td>
        <td>${item.location}</td>
        <td>${item.purchaseDate}</td>
        <td>${item.lastMaintain}</td>
        <td>${item.nextMaintain}</td>
        <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `).join('');

    tbody.dataset.bound = '1';
  }

  function initInfoPage() {
    const tbody = document.getElementById('info-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 运行中: 'badge-success', 维修中: 'badge-warning', 停机: 'badge-danger' };

    function closeModal() {
      removeClass(document.getElementById('modal-overlay'), 'active');
    }

    function showDetail(id) {
      const item = syncState().equipment.find((equipment) => equipment.id === id);
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');

      if (!item || !title || !body) {
        return;
      }

      title.textContent = item.name + ' 设备档案';
      body.innerHTML = `
        <div class="form-row">
          <div class="form-group"><div class="form-label">设备编号</div><div>${item.id}</div></div>
          <div class="form-group"><div class="form-label">设备名称</div><div>${item.name}</div></div>
          <div class="form-group"><div class="form-label">型号</div><div>${item.model}</div></div>
          <div class="form-group"><div class="form-label">位置</div><div>${item.location}</div></div>
          <div class="form-group"><div class="form-label">购入日期</div><div>${item.purchaseDate}</div></div>
          <div class="form-group"><div class="form-label">上次维护</div><div>${item.lastMaintain}</div></div>
          <div class="form-group"><div class="form-label">下次维护</div><div>${item.nextMaintain}</div></div>
          <div class="form-group"><div class="form-label">状态</div><div><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></div></div>
        </div>
      `;

      addClass(document.getElementById('modal-overlay'), 'active');
    }

    function render(list) {
      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.model}</td>
          <td>${item.location}</td>
          <td>${item.purchaseDate}</td>
          <td>${item.lastMaintain}</td>
          <td>${item.nextMaintain}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" data-action="detail" data-id="${item.id}">详情</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function refresh() {
      const keyword = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
      const list = syncState().equipment.filter((item) => {
        const text = `${item.name} ${item.model}`.toLowerCase();
        return !keyword || text.includes(keyword);
      });
      render(list);
    }

    on(document.getElementById('modal-close'), 'click', closeModal);
    on(document.getElementById('modal-cancel'), 'click', closeModal);
    on(document.getElementById('modal-overlay'), 'click', (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    });
    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const name = window.prompt('设备名称');
      if (!name) {
        return;
      }

      createEquipment({
        name,
        model: window.prompt('设备型号', 'NEW-100') || 'NEW-100',
        location: window.prompt('设备位置', '新车间') || '新车间',
        status: window.prompt('设备状态（运行中/维修中/停机）', '运行中') || '运行中'
      });
      refresh();
    });
    delegate(tbody, '[data-action="detail"]', 'click', function() {
      showDetail(this.dataset.id);
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该设备？')) {
        deleteEquipment(this.dataset.id);
        refresh();
      }
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initMaintenancePage() {
    const tbody = document.getElementById('maintenance-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 待执行: 'badge-warning', 进行中: 'badge-info', 已完成: 'badge-success' };

    function render() {
      const list = syncState().maintenance;
      const pending = list.filter((item) => item.status === '待执行').length;
      const inProgress = list.filter((item) => item.status === '进行中').length;
      const totalCost = list.reduce((sum, item) => sum + item.cost, 0);

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">维护计划总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><div class="stat-value">${pending}</div><div class="stat-label">待执行</div></div></div>
        <div class="stat-card"><div class="stat-icon">🔧</div><div class="stat-info"><div class="stat-value">${inProgress}</div><div class="stat-label">进行中</div></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">${formatMoney(totalCost)}</div><div class="stat-label">预估总费用</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.equipName}</strong></td>
          <td>${item.type}</td>
          <td>${item.planDate}</td>
          <td>${item.technician}</td>
          <td>${formatMoney(item.cost)}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></td>
        </tr>
      `).join('');
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const equipName = window.prompt('设备名称');
      if (!equipName) {
        return;
      }

      createMaintenance({
        equipName,
        type: window.prompt('维护类型', '定期保养') || '定期保养',
        technician: window.prompt('责任人', '张工') || '张工',
        cost: window.prompt('预计费用', '3000') || '3000'
      });
      render();
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该维护计划？')) {
        deleteMaintenance(this.dataset.id);
        render();
      }
    });

    tbody.dataset.bound = '1';
    render();
  }

  function initFaultPage() {
    const tbody = document.getElementById('fault-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const severityMap = { 严重: 'badge-danger', 一般: 'badge-warning', 轻微: 'badge-info' };
    const statusMap = { 维修中: 'badge-warning', 待处理: 'badge-danger', 已解决: 'badge-success' };

    function render() {
      const list = syncState().faults;
      const unresolved = list.filter((item) => item.status !== '已解决').length;
      const severe = list.filter((item) => item.severity === '严重').length;

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">故障总数</div></div></div>
        <div class="stat-card"><div class="stat-icon">🔴</div><div class="stat-info"><div class="stat-value">${unresolved}</div><div class="stat-label">未解决</div></div></div>
        <div class="stat-card"><div class="stat-icon">🚨</div><div class="stat-info"><div class="stat-value">${severe}</div><div class="stat-label">严重故障</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.equipName}</strong></td>
          <td>${item.faultDate}</td>
          <td style="max-width:260px;color:var(--color-text-secondary)">${item.description}</td>
          <td><span class="badge ${severityMap[item.severity] || 'badge-default'}">${item.severity}</span></td>
          <td>${item.handler}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></td>
        </tr>
      `).join('');
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const equipName = window.prompt('故障设备名称');
      if (!equipName) {
        return;
      }

      createFault({
        equipName,
        description: window.prompt('故障描述', '设备异常') || '设备异常',
        severity: window.prompt('故障等级（严重/一般/轻微）', '一般') || '一般',
        handler: window.prompt('处理人', '张工') || '张工',
        status: window.prompt('处理状态（待处理/维修中/已解决）', '待处理') || '待处理'
      });
      render();
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该故障记录？')) {
        deleteFault(this.dataset.id);
        render();
      }
    });

    tbody.dataset.bound = '1';
    render();
  }

  function init() {
    try {
      switch (pageName()) {
        case 'index.html':
          if (document.getElementById('equip-tbody')) {
            initIndexPage();
          }
          break;
        case 'monitor.html':
          initMonitorPage();
          break;
        case 'info.html':
          initInfoPage();
          break;
        case 'maintenance.html':
          initMaintenancePage();
          break;
        case 'fault.html':
          initFaultPage();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('equipmentModule.init failed:', error);
    }
  }

  return {
    init,
    getState() {
      return clone(syncState());
    },
    createEquipment,
    deleteEquipment,
    createMaintenance,
    deleteMaintenance,
    createFault,
    deleteFault
  };
})();

window.equipmentModule = equipmentModule;
document.addEventListener('DOMContentLoaded', () => equipmentModule.init());
