'use strict';

window.equipmentSystem = window.equipmentSystem || {};

/**
 * 设备管理页面控制器。
 * 输入：equipmentSystem.store/actions/renderers 与 EnterpriseView。
 * 输出：按当前 HTML 文件名初始化设备总览、状态监控、设备档案、维护计划或故障记录页。
 *
 * 原因：设备域多个子页面共用同一份本地状态，集中分发能避免页面内联脚本漂移。
 */
equipmentSystem.pages = (function(store, actions, renderers, view) {
  // 渲染设备管理首页的设备概览行。
  function renderEquipmentSummaryRow(item) {
    return `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.model}</td>
        <td>${item.location}</td>
        <td>${item.nextMaintain}</td>
        <td><span class="badge ${renderers.equipmentStatusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `;
  }

  // 渲染设备监控页的设备状态行。
  function renderEquipmentMonitorRow(item) {
    return `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.model}</td>
        <td>${item.location}</td>
        <td>${item.purchaseDate}</td>
        <td>${item.lastMaintain}</td>
        <td>${item.nextMaintain}</td>
        <td><span class="badge ${renderers.equipmentStatusMap[item.status] || 'badge-default'}">${item.status}</span></td>
      </tr>
    `;
  }

  // 渲染设备档案页的设备档案行。
  function renderEquipmentInfoRow(item) {
    return `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.model}</td>
        <td>${item.location}</td>
        <td>${item.purchaseDate}</td>
        <td>${item.lastMaintain}</td>
        <td>${item.nextMaintain}</td>
        <td><span class="badge ${renderers.equipmentStatusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" data-action="detail" data-id="${item.id}">详情</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button>
          </div>
        </td>
      </tr>
    `;
  }

  // 渲染设备维护计划行。
  function renderMaintenanceRow(item) {
    return `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.equipName}</strong></td>
        <td>${item.type}</td>
        <td>${item.planDate}</td>
        <td>${item.technician}</td>
        <td>${formatMoney(item.cost)}</td>
        <td><span class="badge ${renderers.maintenanceStatusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        <td><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></td>
      </tr>
    `;
  }

  // 渲染设备故障记录行。
  function renderFaultRow(item) {
    return `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.equipName}</strong></td>
        <td>${item.faultDate}</td>
        <td style="max-width:260px;color:var(--color-text-secondary)">${item.description}</td>
        <td><span class="badge ${renderers.severityMap[item.severity] || 'badge-default'}">${item.severity}</span></td>
        <td>${item.handler}</td>
        <td><span class="badge ${renderers.faultStatusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        <td><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></td>
      </tr>
    `;
  }

  // 初始化设备管理首页。
  function initIndexPage() {
    const tbody = document.getElementById('equip-tbody');
    if (!tbody || tbody.dataset.bound === '1') return;

    const data = store.sync();
    renderers.stats([
      { icon: '🏭', value: data.equipment.length, label: '设备总数' },
      { icon: '✅', value: data.equipment.filter((item) => item.status === '运行中').length, label: '运行中' },
      { icon: '🔧', value: data.equipment.filter((item) => item.status === '维修中').length, label: '维修中' },
      { icon: '⚠️', value: data.faults.filter((item) => item.status !== '已解决').length, label: '待处理故障' }
    ]);

    view.renderRows(tbody, data.equipment, renderEquipmentSummaryRow, { colspan: 6, text: '暂无设备' });

    tbody.dataset.bound = '1';
  }

  // 初始化设备状态监控页。
  function initMonitorPage() {
    const tbody = document.getElementById('monitor-tbody');
    if (!tbody || tbody.dataset.bound === '1') return;

    const list = store.sync().equipment;
    renderers.stats([
      { icon: '🏭', value: list.length, label: '设备总数' },
      { icon: '✅', value: list.filter((item) => item.status === '运行中').length, label: '运行中' },
      { icon: '🔧', value: list.filter((item) => item.status === '维修中').length, label: '维修中' },
      { icon: '🛑', value: list.filter((item) => item.status === '停机').length, label: '停机' }
    ]);

    view.renderRows(tbody, list, renderEquipmentMonitorRow, { colspan: 8, text: '暂无设备监控数据' });

    tbody.dataset.bound = '1';
  }

  // 初始化设备档案页。
  function initInfoPage() {
    const tbody = document.getElementById('info-tbody');
    if (!tbody || tbody.dataset.bound === '1') return;

    // 关闭设备档案详情弹窗。
    function closeModal() {
      removeClass(document.getElementById('modal-overlay'), 'active');
    }

    // 打开设备档案详情弹窗。
    function showDetail(id) {
      const item = store.sync().equipment.find((equipment) => equipment.id === id);
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      if (!item || !title || !body) return;

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
          <div class="form-group"><div class="form-label">状态</div><div><span class="badge ${renderers.equipmentStatusMap[item.status] || 'badge-default'}">${item.status}</span></div></div>
        </div>
      `;
      addClass(document.getElementById('modal-overlay'), 'active');
    }

    // 刷新设备档案页列表。
    function refresh() {
      const keyword = view.getTrimmedValue('search-input');
      const list = view.filterByKeyword(store.sync().equipment, keyword, ['name', 'model']);
      view.renderRows(tbody, list, renderEquipmentInfoRow, { colspan: 9, text: '暂无设备档案' });
    }

    // 打开当前行的设备档案详情。
    function handleDetailClick() {
      showDetail(this.dataset.id);
    }

    // 删除当前行的设备档案。
    function handleEquipmentDelete() {
      view.confirmDelete('确认删除该设备？', () => actions.deleteEquipment(this.dataset.id), refresh);
    }

    view.bindModalClose(closeModal);
    on(document.getElementById('search-input'), 'input', refresh);
    on(document.getElementById('add-btn'), 'click', () => {
      const payload = view.promptFields([
        { name: 'name', label: '设备名称', required: true },
        { name: 'model', label: '设备型号', defaultValue: 'NEW-100' },
        { name: 'location', label: '设备位置', defaultValue: '新车间' },
        { name: 'status', label: '设备状态（运行中/维修中/停机）', defaultValue: '运行中' }
      ]);
      if (!payload) return;

      actions.createEquipment(payload);
      refresh();
    });
    delegate(tbody, '[data-action="detail"]', 'click', handleDetailClick);
    delegate(tbody, '[data-action="delete"]', 'click', handleEquipmentDelete);

    tbody.dataset.bound = '1';
    refresh();
  }

  // 初始化设备维护计划页。
  function initMaintenancePage() {
    const tbody = document.getElementById('maintenance-tbody');
    if (!tbody || tbody.dataset.bound === '1') return;

    // 刷新设备维护统计和维护计划列表。
    function render() {
      const list = store.sync().maintenance;
      renderers.stats([
        { icon: '📋', value: list.length, label: '维护计划总数' },
        { icon: '⏳', value: list.filter((item) => item.status === '待执行').length, label: '待执行' },
        { icon: '🔧', value: list.filter((item) => item.status === '进行中').length, label: '进行中' },
        { icon: '💰', value: formatMoney(list.reduce((sum, item) => sum + item.cost, 0)), label: '预估总费用' }
      ]);

      view.renderRows(tbody, list, renderMaintenanceRow, { colspan: 8, text: '暂无维护计划' });
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const payload = view.promptFields([
        { name: 'equipName', label: '设备名称', required: true },
        { name: 'type', label: '维护类型', defaultValue: '定期保养' },
        { name: 'technician', label: '责任人', defaultValue: '张工' },
        { name: 'cost', label: '预计费用', defaultValue: '3000' }
      ]);
      if (!payload) return;

      actions.createMaintenance(payload);
      render();
    });

    // 删除当前行的设备维护计划。
    function handleMaintenanceDelete() {
      view.confirmDelete('确认删除该维护计划？', () => actions.deleteMaintenance(this.dataset.id), render);
    }

    delegate(tbody, '[data-action="delete"]', 'click', handleMaintenanceDelete);

    tbody.dataset.bound = '1';
    render();
  }

  // 初始化设备故障记录页。
  function initFaultPage() {
    const tbody = document.getElementById('fault-tbody');
    if (!tbody || tbody.dataset.bound === '1') return;

    // 刷新设备故障统计和故障记录列表。
    function render() {
      const list = store.sync().faults;
      renderers.stats([
        { icon: '⚠️', value: list.length, label: '故障总数' },
        { icon: '🔴', value: list.filter((item) => item.status !== '已解决').length, label: '未解决' },
        { icon: '🚨', value: list.filter((item) => item.severity === '严重').length, label: '严重故障' }
      ]);

      view.renderRows(tbody, list, renderFaultRow, { colspan: 8, text: '暂无故障记录' });
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const payload = view.promptFields([
        { name: 'equipName', label: '故障设备名称', required: true },
        { name: 'description', label: '故障描述', defaultValue: '设备异常' },
        { name: 'severity', label: '故障等级（严重/一般/轻微）', defaultValue: '一般' },
        { name: 'handler', label: '处理人', defaultValue: '张工' },
        { name: 'status', label: '处理状态（待处理/维修中/已解决）', defaultValue: '待处理' }
      ]);
      if (!payload) return;

      actions.createFault(payload);
      render();
    });

    // 删除当前行的设备故障记录。
    function handleFaultDelete() {
      view.confirmDelete('确认删除该故障记录？', () => actions.deleteFault(this.dataset.id), render);
    }

    delegate(tbody, '[data-action="delete"]', 'click', handleFaultDelete);

    tbody.dataset.bound = '1';
    render();
  }

  // 按当前设备管理子页面分发初始化逻辑。
  function init() {
    switch (view.pageName()) {
      case 'index.html':
        if (document.getElementById('equip-tbody')) initIndexPage();
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
  }

  return {
    init
  };
})(equipmentSystem.store, equipmentSystem.actions, equipmentSystem.renderers, EnterpriseView);

// 对外暴露设备管理初始化入口，供 module-loader.js 调用。
equipmentSystem.init = function() {
  try {
    equipmentSystem.pages.init();
  } catch (error) {
    console.error('equipmentSystem.init failed:', error);
  }
};

// 对外暴露设备管理状态快照，供调试和兼容 API 使用。
equipmentSystem.getState = function() {
  return equipmentSystem.store.snapshot();
};
