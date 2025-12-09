// N-Gram Analyzer Popup Script

let analysisData = null;

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const exportBtn = document.getElementById('exportBtn');
const loadingState = document.getElementById('loadingState');
const resultsContainer = document.getElementById('resultsContainer');
const emptyState = document.getElementById('emptyState');
const ngramSections = document.getElementById('ngramSections');
const alertsSection = document.getElementById('alertsSection');

// Event Listeners
analyzeBtn.addEventListener('click', analyzePage);
exportBtn.addEventListener('click', exportToCSV);

// Analyze the current page
async function analyzePage() {
    try {
        // Show loading state
        showLoading();

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: 'analyze' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                hideLoading();
                showError('Failed to analyze page. Please refresh the page and try again.');
                return;
            }

            if (response) {
                analysisData = response;
                displayResults(response);
                hideLoading();
            }
        });
    } catch (error) {
        console.error('Error analyzing page:', error);
        hideLoading();
        showError('An error occurred while analyzing the page.');
    }
}

// Display results
function displayResults(data) {
    // Hide empty state, show results
    emptyState.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    // Display alerts
    displayAlerts(data.issues);

    // Display summary
    displaySummary(data.seoMetrics);

    // Display n-grams
    displayNGrams(data.nGramMetrics);
}

// Display alerts
function displayAlerts(issues) {
    alertsSection.innerHTML = '';

    const alerts = [];

    // Keyword stuffing
    if (issues.keywordStuffing.length > 0) {
        const topStuffed = issues.keywordStuffing.slice(0, 3);
        const phrases = topStuffed.map(item => `"${item.phrase}" (${item.density}%)`).join(', ');
        alerts.push({
            type: 'warning',
            message: `⚠️ Keyword Stuffing Detected: ${phrases}`
        });
    }

    // Long sentences
    if (issues.longSentences > 0) {
        alerts.push({
            type: 'info',
            message: `ℹ️ ${issues.longSentences} sentence${issues.longSentences > 1 ? 's' : ''} exceed 25 words`
        });
    }

    // Long paragraphs
    if (issues.longParagraphs > 0) {
        alerts.push({
            type: 'info',
            message: `ℹ️ ${issues.longParagraphs} paragraph${issues.longParagraphs > 1 ? 's' : ''} exceed 120 words`
        });
    }

    // Render alerts
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${alert.type}`;
        alertDiv.textContent = alert.message;
        alertsSection.appendChild(alertDiv);
    });
}

// Display summary
function displaySummary(metrics) {
    document.getElementById('totalWords').textContent = metrics.totalWords.toLocaleString();
    document.getElementById('totalSentences').textContent = metrics.totalSentences.toLocaleString();
    document.getElementById('avgSentenceLength').textContent = `${metrics.avgSentenceLength} words`;
    document.getElementById('totalParagraphs').textContent = metrics.totalParagraphs.toLocaleString();
    document.getElementById('avgParagraphLength').textContent = `${metrics.avgParagraphLength} words`;
    document.getElementById('internalLinks').textContent = metrics.internalLinks.toLocaleString();
    document.getElementById('externalLinks').textContent = metrics.externalLinks.toLocaleString();
    document.getElementById('totalLinks').textContent = metrics.totalLinks.toLocaleString();
    document.getElementById('h1Count').textContent = metrics.h1Count.toLocaleString();
    document.getElementById('h2Count').textContent = metrics.h2Count.toLocaleString();
    document.getElementById('h3Count').textContent = metrics.h3Count.toLocaleString();
    document.getElementById('strongCount').textContent = metrics.strongCount.toLocaleString();
}

// Display n-grams
function displayNGrams(nGramMetrics) {
    ngramSections.innerHTML = '';

    const sizes = ['1', '2', '3', '4', '5'];
    const labels = {
        '1': '1-Gram (Single Words)',
        '2': '2-Gram (Two-Word Phrases)',
        '3': '3-Gram (Three-Word Phrases)',
        '4': '4-Gram (Four-Word Phrases)',
        '5': '5-Gram (Five-Word Phrases)'
    };

    sizes.forEach(size => {
        const grams = nGramMetrics[size] || [];

        // Create collapsible section
        const section = document.createElement('div');
        section.className = 'card ngram-card';

        const header = document.createElement('div');
        header.className = 'ngram-header';
        header.innerHTML = `
      <h2 class="card-title">${labels[size]}</h2>
      <span class="ngram-count">${grams.length} unique phrases</span>
      <button class="collapse-btn" data-size="${size}">
        <svg class="collapse-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

        const content = document.createElement('div');
        content.className = 'ngram-content';
        content.id = `ngram-${size}`;

        // Create table
        if (grams.length > 0) {
            const table = createNGramTable(grams, size);
            content.appendChild(table);
        } else {
            content.innerHTML = '<p class="no-data">No data available</p>';
        }

        section.appendChild(header);
        section.appendChild(content);
        ngramSections.appendChild(section);

        // Add collapse functionality
        const collapseBtn = header.querySelector('.collapse-btn');
        collapseBtn.addEventListener('click', () => toggleCollapse(size));
    });
}

// Create n-gram table
function createNGramTable(grams, size) {
    const table = document.createElement('table');
    table.className = 'ngram-table';
    table.id = `table-${size}`;

    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
    <tr>
      <th class="sortable" data-column="phrase" data-size="${size}">
        Phrase
        <span class="sort-icon">⇅</span>
      </th>
      <th class="sortable" data-column="count" data-size="${size}">
        Count
        <span class="sort-icon">⇅</span>
      </th>
      <th class="sortable" data-column="density" data-size="${size}">
        Density (%)
        <span class="sort-icon">⇅</span>
      </th>
    </tr>
  `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    tbody.id = `tbody-${size}`;

    // Show top 50 results initially
    const displayGrams = grams.slice(0, 50);
    displayGrams.forEach(gram => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td class="phrase-cell">${escapeHtml(gram.phrase)}</td>
      <td class="count-cell">${gram.count.toLocaleString()}</td>
      <td class="density-cell">${gram.density}%</td>
    `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add sort listeners
    const sortHeaders = thead.querySelectorAll('.sortable');
    sortHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            const size = header.dataset.size;
            sortTable(size, column);
        });
    });

    // Show more button if needed
    if (grams.length > 50) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'btn-show-more';
        showMoreBtn.textContent = `Show all ${grams.length} phrases`;
        showMoreBtn.addEventListener('click', () => {
            tbody.innerHTML = '';
            grams.forEach(gram => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td class="phrase-cell">${escapeHtml(gram.phrase)}</td>
          <td class="count-cell">${gram.count.toLocaleString()}</td>
          <td class="density-cell">${gram.density}%</td>
        `;
                tbody.appendChild(row);
            });
            showMoreBtn.remove();
        });

        const wrapper = document.createElement('div');
        wrapper.appendChild(table);
        wrapper.appendChild(showMoreBtn);
        return wrapper;
    }

    return table;
}

// Sort table
let sortState = {};

function sortTable(size, column) {
    const grams = analysisData.nGramMetrics[size];

    // Initialize sort state for this table
    if (!sortState[size]) {
        sortState[size] = { column: null, ascending: true };
    }

    // Toggle sort direction if same column
    if (sortState[size].column === column) {
        sortState[size].ascending = !sortState[size].ascending;
    } else {
        sortState[size].column = column;
        sortState[size].ascending = false; // Default to descending for count/density
        if (column === 'phrase') {
            sortState[size].ascending = true; // Default to ascending for phrase
        }
    }

    // Sort data
    const sorted = [...grams].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        if (column === 'phrase') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (sortState[size].ascending) {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });

    // Update table
    const tbody = document.getElementById(`tbody-${size}`);
    tbody.innerHTML = '';

    sorted.forEach(gram => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td class="phrase-cell">${escapeHtml(gram.phrase)}</td>
      <td class="count-cell">${gram.count.toLocaleString()}</td>
      <td class="density-cell">${gram.density}%</td>
    `;
        tbody.appendChild(row);
    });

    // Update sort icons
    const table = document.getElementById(`table-${size}`);
    const headers = table.querySelectorAll('.sortable');
    headers.forEach(header => {
        const icon = header.querySelector('.sort-icon');
        if (header.dataset.column === column) {
            icon.textContent = sortState[size].ascending ? '↑' : '↓';
        } else {
            icon.textContent = '⇅';
        }
    });
}

// Toggle collapse
function toggleCollapse(size) {
    const content = document.getElementById(`ngram-${size}`);
    const btn = document.querySelector(`[data-size="${size}"]`);
    const icon = btn.querySelector('.collapse-icon');

    content.classList.toggle('collapsed');
    icon.classList.toggle('rotated');
}

// Export to CSV
function exportToCSV() {
    if (!analysisData) return;

    const rows = [['N-Gram Size', 'Phrase', 'Count', 'Density (%)']];

    // Add all n-grams
    const sizes = ['1', '2', '3', '4', '5'];
    sizes.forEach(size => {
        const grams = analysisData.nGramMetrics[size] || [];
        grams.forEach(gram => {
            rows.push([
                `${size}-gram`,
                gram.phrase,
                gram.count,
                gram.density
            ]);
        });
    });

    // Convert to CSV
    const csv = rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ngram-analysis-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Helper functions
function showLoading() {
    loadingState.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    emptyState.classList.remove('hidden');
    emptyState.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" stroke="#EF4444" stroke-width="2"/>
      <path d="M32 20v16M32 44v.01" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <p style="color: #EF4444;">${message}</p>
  `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
