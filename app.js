// ============================================
// STATE MANAGEMENT
// ============================================
const app = {
  state: {
    currentView: 'dashboard',
    entities: [],
    filters: {
      status: '',
      priority: '',
      search: ''
    },
    editingEntity: null
  },

  // ============================================
  // INITIALIZATION
  // ============================================
  init() {
    this.loadFromLocalStorage();
    this.setupEventListeners();
    this.render();
    this.updateStats();
  },

  // ============================================
  // LOCAL STORAGE
  // ============================================
  saveToLocalStorage() {
    try {
      localStorage.setItem('orgspace_data', JSON.stringify({
        entities: this.state.entities,
        version: '1.0'
      }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('orgspace_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.state.entities = parsed.entities || [];
      } else {
        this.loadSampleData();
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      this.loadSampleData();
    }
  },

  loadSampleData() {
    this.state.entities = [
      {
        id: this.generateId(),
        type: 'project',
        title: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'active',
        priority: 'high',
        tags: ['work', 'design'],
        color: '#6366f1',
        createdAt: new Date('2025-01-15').toISOString(),
        dueDate: '2025-03-01',
        checklist: [
          { id: this.generateId(), text: 'Create wireframes', completed: true },
          { id: this.generateId(), text: 'Design mockups', completed: true },
          { id: this.generateId(), text: 'Develop frontend', completed: false },
          { id: this.generateId(), text: 'Test on all devices', completed: false }
        ],
        customFields: {}
      },
      {
        id: this.generateId(),
        type: 'task',
        title: 'Review quarterly goals',
        description: 'Assess progress and adjust targets for Q2',
        status: 'active',
        priority: 'medium',
        tags: ['planning'],
        color: '#10b981',
        createdAt: new Date('2025-02-01').toISOString(),
        dueDate: '2025-02-15',
        checklist: [],
        customFields: {}
      },
      {
        id: this.generateId(),
        type: 'goal',
        title: 'Learn Spanish',
        description: 'Achieve conversational fluency by end of year',
        status: 'active',
        priority: 'medium',
        tags: ['personal', 'learning'],
        color: '#f59e0b',
        createdAt: new Date('2025-01-01').toISOString(),
        dueDate: '2025-12-31',
        checklist: [
          { id: this.generateId(), text: 'Complete Duolingo basics', completed: true },
          { id: this.generateId(), text: 'Practice 30 min daily', completed: false },
          { id: this.generateId(), text: 'Watch Spanish TV shows', completed: false },
          { id: this.generateId(), text: 'Have first conversation', completed: false }
        ],
        customFields: { progress: 35 }
      },
      {
        id: this.generateId(),
        type: 'note',
        title: 'Meeting Notes - Jan 10',
        description: 'Discussed Q1 strategy and team assignments. Key takeaways include new project timeline and resource allocation.',
        status: 'active',
        priority: 'low',
        tags: ['work', 'meetings'],
        color: '#8b5cf6',
        createdAt: new Date('2025-01-10').toISOString(),
        checklist: [],
        customFields: {}
      },
      {
        id: this.generateId(),
        type: 'checklist',
        title: 'Morning Routine',
        description: 'Daily morning routine to start the day right',
        status: 'active',
        priority: 'high',
        tags: ['routine', 'daily'],
        color: '#ec4899',
        createdAt: new Date('2025-01-05').toISOString(),
        checklist: [
          { id: this.generateId(), text: 'Wake up at 6 AM', completed: false },
          { id: this.generateId(), text: 'Drink water', completed: false },
          { id: this.generateId(), text: 'Exercise for 30 minutes', completed: false },
          { id: this.generateId(), text: 'Shower and get ready', completed: false },
          { id: this.generateId(), text: 'Healthy breakfast', completed: false },
          { id: this.generateId(), text: 'Review daily goals', completed: false }
        ],
        customFields: {}
      },
      {
        id: this.generateId(),
        type: 'checklist',
        title: 'Computer Troubleshooting',
        description: 'Steps to diagnose and fix common computer issues',
        status: 'active',
        priority: 'medium',
        tags: ['tech', 'troubleshooting'],
        color: '#06b6d4',
        createdAt: new Date('2025-01-08').toISOString(),
        checklist: [
          { id: this.generateId(), text: 'Restart the computer', completed: false },
          { id: this.generateId(), text: 'Check all cable connections', completed: false },
          { id: this.generateId(), text: 'Run antivirus scan', completed: false },
          { id: this.generateId(), text: 'Update all drivers', completed: false },
          { id: this.generateId(), text: 'Clear browser cache', completed: false },
          { id: this.generateId(), text: 'Check for system updates', completed: false }
        ],
        customFields: {}
      }
    ];
    this.saveToLocalStorage();
  },

  // ============================================
  // EVENT LISTENERS
  // ============================================
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.changeView(view);
      });
    });

    // New Item Button
    document.getElementById('new-item-btn').addEventListener('click', () => {
      this.openCreateModal();
    });

    // Modal Close
    document.getElementById('close-modal-btn').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('close-btn-main').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
      this.saveEntity();
    });

    // Settings and Back buttons
    document.getElementById('settings-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showSettings();
    });

    document.getElementById('back-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.saveCurrentChanges();
      this.showMainView();
    });

    // Form Submit
    document.getElementById('entity-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEntity();
    });

    // Delete Button
    document.getElementById('delete-btn').addEventListener('click', () => {
      this.showDeleteConfirmation();
    });

    document.getElementById('delete-btn-main').addEventListener('click', () => {
      this.showDeleteConfirmation();
    });

    // Delete Modal
    document.getElementById('close-delete-modal').addEventListener('click', () => {
      this.closeDeleteModal();
    });

    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
      this.closeDeleteModal();
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
      this.deleteEntity();
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.state.filters.search = e.target.value.toLowerCase();
      this.render();
    });

    // Filters
    document.getElementById('filter-status').addEventListener('change', (e) => {
      this.state.filters.status = e.target.value;
      this.render();
    });

    document.getElementById('filter-priority').addEventListener('change', (e) => {
      this.state.filters.priority = e.target.value;
      this.render();
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      this.clearFilters();
    });

    // View Tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        // TODO: Implement different view modes
      });
    });

    // Export/Import
    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    // Click outside modal to close
    document.getElementById('entity-modal').addEventListener('click', (e) => {
      if (e.target.id === 'entity-modal') {
        this.closeModal();
      }
    });

    document.getElementById('delete-modal').addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal') {
        this.closeDeleteModal();
      }
    });

    // Entity type change - show/hide checklist
    document.getElementById('entity-type').addEventListener('change', (e) => {
      this.toggleChecklistSection(e.target.value);
    });

    // Add checklist item (main view)
    document.getElementById('add-checklist-item-view').addEventListener('click', () => {
      this.addChecklistItemToMainView();
    });

    // Reset checklist in modal
    document.getElementById('reset-checklist-modal-btn').addEventListener('click', () => {
      this.resetChecklistInModal();
    });
  },

  // ============================================
  // VIEW MANAGEMENT
  // ============================================
  changeView(view) {
    this.state.currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    const titles = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      tasks: 'Tasks',
      goals: 'Goals',
      notes: 'Notes',
      checklists: 'Checklists',
      calendar: 'Calendar',
      habits: 'Habits',
      custom: 'Custom Items'
    };
    
    document.getElementById('page-title').textContent = titles[view] || view;
    
    const subtitles = {
      dashboard: 'Overview of all your activities',
      projects: 'Manage your projects and workflows',
      tasks: 'Track and complete your tasks',
      goals: 'Set and achieve your long-term goals',
      notes: 'Capture ideas and information',
      checklists: 'Reusable checklists for routines and processes',
      calendar: 'Schedule and manage events',
      habits: 'Build positive habits',
      custom: 'Your custom tracked items'
    };
    
    document.getElementById('page-subtitle').textContent = subtitles[view] || '';
    
    this.clearFilters();
    this.render();
  },

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  getFilteredEntities() {
    let entities = [...this.state.entities];
    
    // Filter by view
    if (this.state.currentView !== 'dashboard') {
      const viewTypes = {
        projects: 'project',
        tasks: 'task',
        goals: 'goal',
        notes: 'note',
        checklists: 'checklist',
        habits: 'habit',
        calendar: 'event'
      };
      
      if (viewTypes[this.state.currentView]) {
        entities = entities.filter(e => e.type === viewTypes[this.state.currentView]);
      }
    }
    
    // Filter by status
    if (this.state.filters.status) {
      entities = entities.filter(e => e.status === this.state.filters.status);
    }
    
    // Filter by priority
    if (this.state.filters.priority) {
      entities = entities.filter(e => e.priority === this.state.filters.priority);
    }
    
    // Filter by search
    if (this.state.filters.search) {
      entities = entities.filter(e => 
        e.title.toLowerCase().includes(this.state.filters.search) ||
        (e.description && e.description.toLowerCase().includes(this.state.filters.search)) ||
        e.tags.some(tag => tag.toLowerCase().includes(this.state.filters.search))
      );
    }
    
    // Sort by creation date (newest first)
    entities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return entities;
  },

  clearFilters() {
    this.state.filters = { status: '', priority: '', search: '' };
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-priority').value = '';
    document.getElementById('search-input').value = '';
    this.render();
  },

  // ============================================
  // RENDERING
  // ============================================
  render() {
    const contentArea = document.getElementById('content-area');
    const filteredEntities = this.getFilteredEntities();

    if (filteredEntities.length === 0) {
      contentArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No items found</h3>
          <p>Create your first item or adjust your filters</p>
        </div>
      `;
      return;
    }

    contentArea.innerHTML = filteredEntities.map(entity => this.renderEntityCard(entity)).join('');
    
    // Add click listeners to entity cards
    document.querySelectorAll('.entity-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.action-btn')) {
          const id = card.dataset.id;
          this.openEditModal(id);
        }
      });
    });
  },

  renderEntityCard(entity) {
    const dueDate = entity.dueDate ? new Date(entity.dueDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }) : '';
    
    const priorityClass = `priority-${entity.priority}`;
    
    // Calculate checklist progress
    const checklist = entity.checklist || [];
    const completed = checklist.filter(item => item.completed).length;
    const total = checklist.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // For standalone checklists, show a reset button
    const isStandaloneChecklist = entity.type === 'checklist';
    
    const checklistHtml = total > 0 ? `
      <div class="checklist-container">
        <div class="checklist-header">
          <span class="checklist-title">Checklist</span>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="checklist-progress">${completed}/${total} completed</span>
            ${isStandaloneChecklist ? `<button class="btn-reset-checklist" onclick="app.resetChecklist('${entity.id}'); event.stopPropagation();">Reset</button>` : ''}
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    ` : '';
    
    return `
      <div class="entity-card ${priorityClass}" data-id="${entity.id}">
        <div class="entity-header">
          <div>
            <div class="entity-title">${this.escapeHtml(entity.title)}</div>
            <div class="entity-type">${entity.type}</div>
          </div>
          <span class="entity-status status-${entity.status}">${entity.status}</span>
        </div>
        <div class="entity-description">${this.escapeHtml(entity.description || 'No description')}</div>
        ${checklistHtml}
        <div class="entity-footer">
          <div class="entity-tags">
            ${entity.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
          ${dueDate ? `<div class="entity-date">📅 ${dueDate}</div>` : ''}
        </div>
      </div>
    `;
  },

  // ============================================
  // MODAL MANAGEMENT
  // ============================================
  showMainView() {
    document.getElementById('main-view').style.display = 'block';
    document.getElementById('settings-view').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('settings-btn').style.display = 'block';
  },

  showSettings() {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('settings-view').style.display = 'block';
    document.getElementById('back-btn').style.display = 'flex';
    document.getElementById('settings-btn').style.display = 'none';
  },

  saveCurrentChanges() {
    // Get checklist items from main view and update form
    const items = [];
    document.querySelectorAll('.checklist-item-interactive').forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const textInput = item.querySelector('input[type="text"]');
      const itemId = item.dataset.itemId;
      
      if (textInput && textInput.value.trim()) {
        items.push({
          id: itemId,
          text: textInput.value.trim(),
          completed: checkbox ? checkbox.checked : false
        });
      }
    });
    
    // Store in temporary state
    if (this.state.editingEntity) {
      this.state.editingEntity.checklist = items;
      this.saveToLocalStorage();
      this.render();
    }
  },

  toggleChecklistSection(type) {
    const checklistView = document.getElementById('checklist-view');
    // Show checklist for projects, goals, tasks, and dedicated checklists
    if (type === 'project' || type === 'goal' || type === 'task' || type === 'checklist') {
      checklistView.style.display = 'block';
    } else {
      checklistView.style.display = 'none';
    }
  },

  addChecklistItemToMainView(text = '', completed = false, itemId = null) {
    const container = document.getElementById('checklist-items-view');
    const id = itemId || this.generateId();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item-interactive';
    itemDiv.dataset.itemId = id;
    
    itemDiv.innerHTML = `
      <input type="checkbox" ${completed ? 'checked' : ''}>
      <input type="text" placeholder="Enter item..." value="${this.escapeHtml(text)}">
      <button class="btn-remove-item" onclick="app.removeChecklistItemFromMainView('${id}')">✕</button>
    `;
    
    container.appendChild(itemDiv);
    
    // Auto-save on checkbox change
    const checkbox = itemDiv.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      this.saveCurrentChanges();
    });
    
    // Auto-save on text change (debounced)
    const textInput = itemDiv.querySelector('input[type="text"]');
    let timeout;
    textInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveCurrentChanges();
      }, 500);
    });
  },

  removeChecklistItemFromMainView(itemId) {
    const item = document.querySelector(`.checklist-item-interactive[data-item-id="${itemId}"]`);
    if (item) {
      item.remove();
      this.saveCurrentChanges();
    }
  },

  addChecklistItemToForm(text = '', completed = false, itemId = null) {
    const container = document.getElementById('checklist-items');
    const id = itemId || this.generateId();
    
    const itemHtml = `
      <div class="checklist-item-form" data-item-id="${id}">
        <input type="checkbox" class="checklist-checkbox-form" ${completed ? 'checked' : ''}>
        <input type="text" class="checklist-item-input" placeholder="Checklist item..." value="${this.escapeHtml(text)}">
        <button type="button" class="checklist-item-remove" onclick="app.removeChecklistItemFromForm('${id}')">Remove</button>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
  },

  removeChecklistItemFromForm(itemId) {
    const item = document.querySelector(`[data-item-id="${itemId}"]`);
    if (item) {
      item.remove();
    }
  },

  getChecklistFromForm() {
    const items = [];
    document.querySelectorAll('.checklist-item-form').forEach(form => {
      const input = form.querySelector('.checklist-item-input');
      const checkbox = form.querySelector('.checklist-checkbox-form');
      const itemId = form.dataset.itemId;
      
      if (input && input.value.trim()) {
        items.push({
          id: itemId,
          text: input.value.trim(),
          completed: checkbox ? checkbox.checked : false
        });
      }
    });
    return items;
  },

  openCreateModal() {
    this.state.editingEntity = null;
    document.getElementById('modal-title').textContent = 'Create New Item';
    document.getElementById('delete-btn').style.display = 'none';
    document.getElementById('delete-btn-main').style.display = 'none';
    document.getElementById('entity-form').reset();
    document.getElementById('entity-id').value = '';
    document.getElementById('entity-color').value = '#6366f1';
    document.getElementById('checklist-items-view').innerHTML = '';
    document.getElementById('checklist-view').style.display = 'none';
    this.showSettings(); // Start in settings view for new items
    document.getElementById('entity-modal').classList.add('active');
  },

  openEditModal(id) {
    const entity = this.state.entities.find(e => e.id === id);
    if (!entity) return;
    
    this.state.editingEntity = entity;
    document.getElementById('modal-title').textContent = entity.title;
    document.getElementById('delete-btn').style.display = 'inline-flex';
    document.getElementById('delete-btn-main').style.display = 'inline-flex';
    
    // Show reset button only for dedicated checklists
    const resetBtn = document.getElementById('reset-checklist-modal-btn');
    if (entity.type === 'checklist') {
      resetBtn.style.display = 'inline-flex';
    } else {
      resetBtn.style.display = 'none';
    }
    
    // Populate form (settings view)
    document.getElementById('entity-id').value = entity.id;
    document.getElementById('entity-type').value = entity.type;
    document.getElementById('entity-title').value = entity.title;
    document.getElementById('entity-description').value = entity.description || '';
    document.getElementById('entity-status').value = entity.status;
    document.getElementById('entity-priority').value = entity.priority;
    document.getElementById('entity-due-date').value = entity.dueDate || '';
    document.getElementById('entity-color').value = entity.color || '#6366f1';
    document.getElementById('entity-tags').value = entity.tags.join(', ');
    
    // Populate main view
    document.getElementById('checklist-view-title').textContent = entity.title;
    document.getElementById('checklist-view-description').textContent = entity.description || 'No description';
    
    // Show/hide and populate checklist
    this.toggleChecklistSection(entity.type);
    document.getElementById('checklist-items-view').innerHTML = '';
    
    if (entity.checklist && entity.checklist.length > 0) {
      entity.checklist.forEach(item => {
        this.addChecklistItemToMainView(item.text, item.completed, item.id);
      });
    }
    
    // Start in main view for existing items
    this.showMainView();
    document.getElementById('entity-modal').classList.add('active');
  },

  closeModal() {
    // Auto-save before closing if editing
    if (this.state.editingEntity) {
      this.saveCurrentChanges();
    }
    document.getElementById('entity-modal').classList.remove('active');
    this.state.editingEntity = null;
    this.showMainView();
  },

  showDeleteConfirmation() {
    document.getElementById('delete-modal').classList.add('active');
  },

  closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
  },

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  saveEntity() {
    const form = document.getElementById('entity-form');
    const formData = new FormData(form);
    const id = document.getElementById('entity-id').value;
    
    // Get checklist from main view
    const checklist = [];
    document.querySelectorAll('.checklist-item-interactive').forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const textInput = item.querySelector('input[type="text"]');
      const itemId = item.dataset.itemId;
      
      if (textInput && textInput.value.trim()) {
        checklist.push({
          id: itemId,
          text: textInput.value.trim(),
          completed: checkbox ? checkbox.checked : false
        });
      }
    });
    
    const entity = {
      id: id || this.generateId(),
      type: formData.get('type'),
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate') || null,
      color: formData.get('color'),
      tags: formData.get('tags')
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      checklist: checklist,
      createdAt: id ? this.state.editingEntity.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customFields: id ? this.state.editingEntity.customFields : {}
    };

    if (id) {
      // Update existing
      const index = this.state.entities.findIndex(e => e.id === id);
      this.state.entities[index] = entity;
    } else {
      // Create new
      this.state.entities.push(entity);
    }

    this.saveToLocalStorage();
    this.closeModal();
    this.render();
    this.updateStats();
  },

  deleteEntity() {
    if (!this.state.editingEntity) return;
    
    this.state.entities = this.state.entities.filter(
      e => e.id !== this.state.editingEntity.id
    );
    
    this.saveToLocalStorage();
    this.closeDeleteModal();
    this.closeModal();
    this.render();
    this.updateStats();
  },

  resetChecklist(entityId) {
    const entity = this.state.entities.find(e => e.id === entityId);
    if (!entity || !entity.checklist) return;
    
    // Reset all checklist items to uncompleted
    entity.checklist.forEach(item => {
      item.completed = false;
    });
    
    this.saveToLocalStorage();
    this.render();
  },

  resetChecklistInModal() {
    if (!this.state.editingEntity || !this.state.editingEntity.checklist) return;
    
    if (confirm('Are you sure you want to uncheck all items?')) {
      // Uncheck all checkboxes in the modal
      document.querySelectorAll('.checklist-item-interactive input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Update the entity
      this.state.editingEntity.checklist.forEach(item => {
        item.completed = false;
      });
      
      this.saveToLocalStorage();
      this.render();
    }
  },

  // ============================================
  // STATISTICS
  // ============================================
  updateStats() {
    const active = this.state.entities.filter(e => e.status === 'active');
    const completed = this.state.entities.filter(e => e.status === 'completed');
    
    const projects = active.filter(e => e.type === 'project').length;
    const tasks = active.filter(e => e.type === 'task').length;
    
    const total = this.state.entities.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    document.getElementById('stat-projects').textContent = projects;
    document.getElementById('stat-tasks').textContent = tasks;
    document.getElementById('stat-streak').textContent = '7';
    document.getElementById('stat-completion').textContent = completionRate + '%';
  },

  // ============================================
  // IMPORT/EXPORT
  // ============================================
  exportData() {
    const data = {
      entities: this.state.entities,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orgspace-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.entities && Array.isArray(data.entities)) {
          if (confirm('This will replace all current data. Continue?')) {
            this.state.entities = data.entities;
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  // ============================================
  // UTILITIES
  // ============================================
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});