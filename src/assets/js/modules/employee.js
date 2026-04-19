'use strict';

const employeeModule = (function() {
  const STORAGE_KEY = 'xm_employee_state';
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function getDefaults() {
    const source = typeof employeeData !== 'undefined' ? employeeData : {};
    return {
      employees: clone(source.employees || []),
      attendance: clone(source.attendance || []),
      recruitment: clone(source.recruitment || []),
      performance: clone(source.performance || [])
    };
  }

  function loadState() {
    const defaults = getDefaults();
    const stored = typeof storage !== 'undefined' && typeof storage.get === 'function'
      ? storage.get(STORAGE_KEY)
      : null;

    return {
      employees: Array.isArray(stored && stored.employees) ? stored.employees : defaults.employees,
      attendance: Array.isArray(stored && stored.attendance) ? stored.attendance : defaults.attendance,
      recruitment: Array.isArray(stored && stored.recruitment) ? stored.recruitment : defaults.recruitment,
      performance: Array.isArray(stored && stored.performance) ? stored.performance : defaults.performance
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

  function bindModalClose(closeModal) {
    on(document.getElementById('modal-close'), 'click', closeModal);
    on(document.getElementById('modal-cancel'), 'click', closeModal);
    on(document.getElementById('modal-overlay'), 'click', (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    });
  }

  function renderEmployeeStats(list) {
    const total = list.length;
    const active = list.filter((item) => item.status === '在职').length;
    const trial = list.filter((item) => item.status === '试用期').length;
    const depts = new Set(list.map((item) => item.dept)).size;

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">${total}</div><div class="stat-label">员工总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">${active}</div><div class="stat-label">在职员工</div></div></div>
      <div class="stat-card"><div class="stat-icon">🕐</div><div class="stat-info"><div class="stat-value">${trial}</div><div class="stat-label">试用期员工</div></div></div>
      <div class="stat-card"><div class="stat-icon">🏢</div><div class="stat-info"><div class="stat-value">${depts}</div><div class="stat-label">部门数量</div></div></div>
    `);
  }

  function renderEmployeeTable(list) {
    const statusMap = { 在职: 'badge-success', 试用期: 'badge-warning', 离职: 'badge-danger' };

    setHtml('employee-tbody', list.map((item) => `
      <tr>
        <td>${item.id}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.gender}</td>
        <td>${item.dept}</td>
        <td>${item.position}</td>
        <td>${item.entryDate}</td>
        <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
        <td><div class="table-actions"><button class="btn btn-outline btn-sm" data-action="detail" data-id="${item.id}">详情</button></div></td>
      </tr>
    `).join(''));
  }

  function renderDeptFilter(list) {
    const select = document.getElementById('dept-filter');
    if (!select) {
      return;
    }

    const currentValue = select.value;
    const defaultOption = select.options[0]
      ? `<option value="${select.options[0].value}">${select.options[0].textContent}</option>`
      : '<option value="">全部部门</option>';
    const options = Array.from(new Set(list.map((item) => item.dept))).map((dept) => `
      <option value="${dept}">${dept}</option>
    `);

    select.innerHTML = defaultOption + options.join('');
    select.value = currentValue;
  }

  function showEmployeeDetail(id) {
    const employee = syncState().employees.find((item) => item.id === id);
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    if (!employee || !title || !body) {
      return;
    }

    title.textContent = employee.name + ' 的员工档案';
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><div class="form-label">工号</div><div>${employee.id}</div></div>
        <div class="form-group"><div class="form-label">姓名</div><div>${employee.name}</div></div>
        <div class="form-group"><div class="form-label">性别</div><div>${employee.gender}</div></div>
        <div class="form-group"><div class="form-label">部门</div><div>${employee.dept}</div></div>
        <div class="form-group"><div class="form-label">职位</div><div>${employee.position}</div></div>
        <div class="form-group"><div class="form-label">手机</div><div>${employee.phone}</div></div>
        <div class="form-group"><div class="form-label">邮箱</div><div>${employee.email}</div></div>
        <div class="form-group"><div class="form-label">入职日期</div><div>${employee.entryDate}</div></div>
        <div class="form-group"><div class="form-label">薪资</div><div>${formatMoney(employee.salary)}</div></div>
        <div class="form-group"><div class="form-label">状态</div><div>${employee.status}</div></div>
      </div>
    `;

    addClass(document.getElementById('modal-overlay'), 'active');
  }

  function createEmployee(payload) {
    state = syncState();
    const employee = {
      id: nextId('E', state.employees),
      name: payload.name,
      gender: payload.gender || '男',
      dept: payload.dept || '未分配',
      position: payload.position || '待定',
      phone: payload.phone || '',
      email: payload.email || '',
      entryDate: payload.entryDate || '',
      salary: Number(payload.salary) || 0,
      status: payload.status || '试用期'
    };

    state.employees.push(employee);
    persist();
    return employee;
  }

  function updateEmployee(id, payload) {
    state = syncState();
    const employee = state.employees.find((item) => item.id === id);
    if (!employee) {
      return null;
    }

    Object.assign(employee, {
      name: payload.name,
      gender: payload.gender,
      dept: payload.dept,
      position: payload.position,
      phone: payload.phone,
      email: payload.email,
      entryDate: payload.entryDate,
      salary: Number(payload.salary) || 0
    });
    persist();
    return employee;
  }

  function deleteEmployee(id) {
    state = syncState();
    state.employees = state.employees.filter((item) => item.id !== id);
    persist();
  }

  function createRecruitment(payload) {
    state = syncState();
    const item = {
      id: nextId('R', state.recruitment),
      position: payload.position,
      dept: payload.dept || '人事部',
      headcount: Number(payload.headcount) || 1,
      status: payload.status || '待发布',
      publishDate: payload.publishDate || '2026-04-19',
      deadline: payload.deadline || '2026-05-19',
      applicants: Number(payload.applicants) || 0
    };

    state.recruitment.push(item);
    persist();
    return item;
  }

  function deleteRecruitment(id) {
    state = syncState();
    state.recruitment = state.recruitment.filter((item) => item.id !== id);
    persist();
  }

  function initIndexPage() {
    const tbody = document.getElementById('employee-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const searchInput = document.getElementById('search-input');
    const deptFilter = document.getElementById('dept-filter');
    const closeModal = () => removeClass(document.getElementById('modal-overlay'), 'active');

    function refresh() {
      const employees = syncState().employees;
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const dept = deptFilter ? deptFilter.value : '';
      const filtered = employees.filter((item) => {
        const text = `${item.name} ${item.dept} ${item.position}`.toLowerCase();
        return (!keyword || text.includes(keyword)) && (!dept || item.dept === dept);
      });

      renderEmployeeStats(employees);
      renderDeptFilter(employees);
      renderEmployeeTable(filtered);
    }

    bindModalClose(closeModal);
    on(searchInput, 'input', refresh);
    on(deptFilter, 'change', refresh);
    delegate(tbody, '[data-action="detail"]', 'click', function() {
      showEmployeeDetail(this.dataset.id);
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function initAttendancePage() {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const list = syncState().attendance;
    const totalWork = list.reduce((sum, item) => sum + item.actualDays, 0);
    const totalOvertime = list.reduce((sum, item) => sum + item.overtimeHours, 0);
    const totalLate = list.reduce((sum, item) => sum + item.lateTimes, 0);

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">统计人数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-value">${totalWork}</div><div class="stat-label">总出勤天数</div></div></div>
      <div class="stat-card"><div class="stat-icon">⏰</div><div class="stat-info"><div class="stat-value">${totalOvertime}h</div><div class="stat-label">总加班时长</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-info"><div class="stat-value">${totalLate}</div><div class="stat-label">迟到次数</div></div></div>
    `);

    tbody.innerHTML = list.map((item) => {
      const rate = ((item.actualDays / item.workDays) * 100).toFixed(1);
      const rateClass = rate >= 95 ? 'badge-success' : rate >= 85 ? 'badge-warning' : 'badge-danger';
      return `
        <tr>
          <td>${item.empId}</td>
          <td><strong>${item.empName}</strong></td>
          <td>${item.workDays} 天</td>
          <td>${item.actualDays} 天</td>
          <td>${item.lateTimes > 0 ? `<span class="badge badge-warning">${item.lateTimes} 次</span>` : '—'}</td>
          <td>${item.leaveDays > 0 ? item.leaveDays + ' 天' : '—'}</td>
          <td>${item.overtimeHours} h</td>
          <td><span class="badge ${rateClass}">${rate}%</span></td>
        </tr>
      `;
    }).join('');

    tbody.dataset.bound = '1';
  }

  function initPerformancePage() {
    const tbody = document.getElementById('perf-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const list = syncState().performance;
    const average = list.length ? (list.reduce((sum, item) => sum + item.score, 0) / list.length).toFixed(1) : '0.0';
    const aCount = list.filter((item) => String(item.grade).startsWith('A')).length;
    const gradeMap = { 'A+': 'badge-success', A: 'badge-success', 'B+': 'badge-info', B: 'badge-info', C: 'badge-warning' };

    setHtml('stats-grid', `
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">参评人数</div></div></div>
      <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-info"><div class="stat-value">${average}</div><div class="stat-label">平均分</div></div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-info"><div class="stat-value">${aCount}</div><div class="stat-label">A级人数</div></div></div>
    `);

    tbody.innerHTML = list.map((item) => `
      <tr>
        <td>${item.empId}</td>
        <td><strong>${item.empName}</strong></td>
        <td>${item.dept}</td>
        <td>${item.period}</td>
        <td><strong>${item.score}</strong></td>
        <td><span class="badge ${gradeMap[item.grade] || 'badge-default'}">${item.grade}</span></td>
        <td style="color:var(--color-text-secondary)">${item.comment}</td>
      </tr>
    `).join('');

    tbody.dataset.bound = '1';
  }

  function initRecruitmentPage() {
    const tbody = document.getElementById('recruit-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 招聘中: 'badge-success', 已完成: 'badge-info', 待发布: 'badge-default' };

    function render() {
      const list = syncState().recruitment;
      const active = list.filter((item) => item.status === '招聘中').length;
      const total = list.reduce((sum, item) => sum + item.headcount, 0);
      const applicants = list.reduce((sum, item) => sum + item.applicants, 0);

      setHtml('stats-grid', `
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-value">${list.length}</div><div class="stat-label">招聘计划</div></div></div>
        <div class="stat-card"><div class="stat-icon">🟢</div><div class="stat-info"><div class="stat-value">${active}</div><div class="stat-label">招聘中</div></div></div>
        <div class="stat-card"><div class="stat-icon">👤</div><div class="stat-info"><div class="stat-value">${total}</div><div class="stat-label">招聘总人数</div></div></div>
        <div class="stat-card"><div class="stat-icon">📨</div><div class="stat-info"><div class="stat-value">${applicants}</div><div class="stat-label">总投递数</div></div></div>
      `);

      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.position}</strong></td>
          <td>${item.dept}</td>
          <td>${item.headcount} 人</td>
          <td>${item.publishDate}</td>
          <td>${item.deadline}</td>
          <td>${item.applicants}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td><div class="table-actions"><button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button></div></td>
        </tr>
      `).join('');
    }

    on(document.getElementById('add-btn'), 'click', () => {
      const position = window.prompt('职位名称');
      if (!position) {
        return;
      }

      createRecruitment({
        position,
        dept: window.prompt('所属部门', '人事部') || '人事部',
        headcount: window.prompt('招聘人数', '1') || '1',
        status: window.prompt('状态（招聘中/待发布/已完成）', '招聘中') || '招聘中'
      });
      render();
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该招聘计划？')) {
        deleteRecruitment(this.dataset.id);
        render();
      }
    });

    tbody.dataset.bound = '1';
    render();
  }

  function initInfoPage() {
    const tbody = document.getElementById('info-tbody');
    if (!tbody || tbody.dataset.bound === '1') {
      return;
    }

    const statusMap = { 在职: 'badge-success', 试用期: 'badge-warning', 离职: 'badge-danger' };
    let editingId = null;

    function closeModal() {
      removeClass(document.getElementById('modal-overlay'), 'active');
      editingId = null;
    }

    function openModal(title) {
      const titleElement = document.getElementById('modal-title');
      const errorElement = document.getElementById('form-error');
      if (titleElement) {
        titleElement.textContent = title;
      }
      if (errorElement) {
        errorElement.textContent = '';
      }
      addClass(document.getElementById('modal-overlay'), 'active');
    }

    function fillForm(employee) {
      const fields = {
        name: employee.name || '',
        gender: employee.gender || '男',
        dept: employee.dept || '',
        position: employee.position || '',
        phone: employee.phone || '',
        email: employee.email || '',
        entryDate: employee.entryDate || '',
        salary: employee.salary || ''
      };

      Object.keys(fields).forEach((key) => {
        const element = document.getElementById('f-' + key);
        if (element) {
          element.value = fields[key];
        }
      });
    }

    function readForm() {
      return {
        name: ((document.getElementById('f-name') || {}).value || '').trim(),
        gender: (document.getElementById('f-gender') || {}).value || '男',
        dept: ((document.getElementById('f-dept') || {}).value || '').trim(),
        position: ((document.getElementById('f-position') || {}).value || '').trim(),
        phone: ((document.getElementById('f-phone') || {}).value || '').trim(),
        email: ((document.getElementById('f-email') || {}).value || '').trim(),
        entryDate: (document.getElementById('f-entryDate') || {}).value || '',
        salary: (document.getElementById('f-salary') || {}).value || 0
      };
    }

    function render(list) {
      tbody.innerHTML = list.map((item) => `
        <tr>
          <td>${item.id}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.gender}</td>
          <td>${item.dept}</td>
          <td>${item.position}</td>
          <td>${item.phone}</td>
          <td>${item.entryDate}</td>
          <td>${formatMoney(item.salary)}</td>
          <td><span class="badge ${statusMap[item.status] || 'badge-default'}">${item.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" data-action="edit" data-id="${item.id}">编辑</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}">删除</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function refresh() {
      const keyword = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
      const list = syncState().employees.filter((item) => {
        const text = `${item.id} ${item.name}`.toLowerCase();
        return !keyword || text.includes(keyword);
      });
      render(list);
    }

    bindModalClose(closeModal);
    on(document.getElementById('add-btn'), 'click', () => {
      editingId = null;
      fillForm({ gender: '男' });
      openModal('新增员工');
    });
    on(document.getElementById('modal-save'), 'click', () => {
      const form = readForm();
      const errorElement = document.getElementById('form-error');
      if (!form.name) {
        if (errorElement) {
          errorElement.textContent = '姓名为必填项';
        }
        return;
      }

      if (editingId) {
        updateEmployee(editingId, form);
      } else {
        createEmployee(form);
      }

      closeModal();
      refresh();
    });
    on(document.getElementById('search-input'), 'input', refresh);
    delegate(tbody, '[data-action="edit"]', 'click', function() {
      const employee = syncState().employees.find((item) => item.id === this.dataset.id);
      if (!employee) {
        return;
      }
      editingId = employee.id;
      fillForm(employee);
      openModal('编辑员工');
    });
    delegate(tbody, '[data-action="delete"]', 'click', function() {
      if (window.confirm('确认删除该员工？')) {
        deleteEmployee(this.dataset.id);
        refresh();
      }
    });

    tbody.dataset.bound = '1';
    refresh();
  }

  function init() {
    try {
      switch (pageName()) {
        case 'index.html':
          if (document.getElementById('employee-tbody')) {
            initIndexPage();
          }
          break;
        case 'attendance.html':
          initAttendancePage();
          break;
        case 'performance.html':
          initPerformancePage();
          break;
        case 'recruitment.html':
          initRecruitmentPage();
          break;
        case 'info.html':
          initInfoPage();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('employeeModule.init failed:', error);
    }
  }

  return {
    init,
    getState() {
      return clone(syncState());
    },
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createRecruitment,
    deleteRecruitment
  };
})();

window.employeeModule = employeeModule;
document.addEventListener('DOMContentLoaded', () => employeeModule.init());
