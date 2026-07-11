(async () => {
  const dataUrl = 'data/files.json';
  let documents = [];
  let filteredDocs = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Elements
  const sidebarItems = document.querySelectorAll('.sidebar li');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const loadingOverlay = document.getElementById('loading');

  // Utility functions
  const showLoading = () => loadingOverlay.classList.remove('hide');
  const hideLoading = () => loadingOverlay.classList.add('hide');

  // Load data
  async function loadDocuments() {
    showLoading();
    try {
      const res = await fetch(dataUrl);
      documents = await res.json();
      filteredDocs = [...documents];
      updateDashboard();
      populateCategoryFilter();
      renderDashboard();
    } catch (e) {
      console.error('Error loading documents:', e);
    } finally {
      hideLoading();
    }
  }

  // Update dashboard stats
  function updateDashboard() {
    document.getElementById('total-count').textContent = documents.length;
    populateCategoryList();
    populateRecentDocs();
  }

  // Populate categories in dashboard
  function populateCategoryList() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    const cats = [...new Set(documents.map(d => d.Category))];
    cats.forEach(cat => {
      const li = document.createElement('li');
      li.textContent = cat;
      list.appendChild(li);
    });
  }

  // Populate recent documents
  function populateRecentDocs() {
    const list = document.getElementById('recent-docs');
    list.innerHTML = '';
    const recent = [...documents].sort((a,b) => new Date(b['Upload Date']) - new Date(a['Upload Date'])).slice(0,5);
    recent.forEach(doc => {
      const li = document.createElement('li');
      li.textContent = doc['Document Name'];
      list.appendChild(li);
    });
  }

  // Populate category filter dropdown
  function populateCategoryFilter() {
    const select = document.getElementById('category-filter');
    select.innerHTML = '<option value="">All Categories</option>';
    const cats = [...new Set(documents.map(d => d.Category))];
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  }

  // Render documents table
  function renderDocuments() {
    const tbody = document.querySelector('#documents-table tbody');
    tbody.innerHTML = '';

    // Apply filters
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    filteredDocs = documents.filter(d => {
      return (categoryFilter ? d.Category===categoryFilter : true) &&
             (statusFilter ? d.Status===statusFilter : true);
    });

    // Pagination
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const startIdx = (currentPage -1) * itemsPerPage;
    const pageDocs = filteredDocs.slice(startIdx, startIdx + itemsPerPage);

    // Populate table
    pageDocs.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d['Document ID']}</td>
        <td>${d['Document Name']}</td>
        <td>${d['Category']}</td>
        <td>${d['Department']}</td>
        <td>${d['File Type']}</td>
        <td>${(d['File Size']/1024).toFixed(2)} KB</td>
        <td>${d['Upload Date']}</td>
        <td>${d['Uploaded By']}</td>
        <td>${d['Status']}</td>
        <td>
          <button class="view-btn" data-id="${d['Document ID']}"><i class="fas fa-eye"></i></button>
          <button class="download-btn" data-path="${d['File Path']}"><i class="fas fa-download"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    renderPagination(totalPages);
    attachTableActions();
  }

  // Pagination controls
  function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';
    for (let i=1; i<=totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i===currentPage) btn.disabled = true;
      btn.onclick = () => {
        currentPage = i;
        renderDocuments();
      };
      container.appendChild(btn);
    }
  }

  // Actions: view & download
  function attachTableActions() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        window.location.href = `viewer.html?id=${id}`;
      };
    });
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.onclick = () => {
        const path = btn.dataset.path;
        const a = document.createElement('a');
        a.href = path;
        a.download = path.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    });
  }

  // Navigation
  sidebarItems.forEach(item => {
    item.onclick = () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page;
      window.location.href = `${page}.html`;
    };
  });

  // Filters
  document.getElementById('category-filter').onchange = () => {
    currentPage=1; renderDocuments();
  };
  document.getElementById('status-filter').onchange = () => {
    currentPage=1; renderDocuments();
  };

  // Search
  document.getElementById('search-btn').onclick = () => {
    const q = document.getElementById('search-input').value.toLowerCase();
    filteredDocs = documents.filter(d => Object.values(d).some(val => String(val).toLowerCase().includes(q)));
    currentPage=1; renderDocuments();
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
  });
})();
