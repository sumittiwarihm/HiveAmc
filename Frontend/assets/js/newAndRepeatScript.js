document.addEventListener('DOMContentLoaded', () => {
    console.log("New & Repeat Script Loaded");

    // ==========================================
    // 1. DATE PICKER LOGIC
    // ==========================================
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const selectedRangeText = document.getElementById('selectedRangeText');
    const applyDateBtn = document.getElementById('applyDateBtn');

    let currentDate = new Date(2025, 11, 1);
    let startDate = new Date(2025, 10, 18);
    let endDate = new Date(2025, 11, 18);
    let tempStartDate = startDate;
    let tempEndDate = endDate;

    function formatDate(d) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (dateTrigger && dateDropdown) {
        dateTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dateDropdown.classList.toggle('show');
            renderCalendars(); 
        });

        dateDropdown.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', () => dateDropdown.classList.remove('show'));
    }

    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendars(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendars(); });

    function renderCalendars() {
        const year1 = currentDate.getFullYear();
        const month1 = currentDate.getMonth();
        renderSingleMonth('calendar1', year1, month1, 'monthLabel1');
        const nextM = new Date(year1, month1 + 1, 1);
        renderSingleMonth('calendar2', nextM.getFullYear(), nextM.getMonth(), 'monthLabel2');
    }

    function renderSingleMonth(containerId, year, month, labelId) {
        const container = document.getElementById(containerId);
        const label = document.getElementById(labelId);
        if (!container || !label) return;

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        label.innerText = `${monthNames[month]} ${year}`;
        container.innerHTML = '';

        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
            const el = document.createElement('div');
            el.className = 'day-name';
            el.innerText = d;
            container.appendChild(el);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            container.appendChild(document.createElement('div')).className = 'day-cell empty';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.innerText = i;
            
            const tStart = tempStartDate ? new Date(tempStartDate).setHours(0,0,0,0) : null;
            const tEnd = tempEndDate ? new Date(tempEndDate).setHours(0,0,0,0) : null;
            const current = new Date(year, month, i).setHours(0,0,0,0);

            if (current === tStart) cell.classList.add('selected', 'range-start');
            if (current === tEnd) cell.classList.add('selected', 'range-end');
            if (tStart && tEnd && current > tStart && current < tEnd) cell.classList.add('in-range');

            cell.addEventListener('click', () => handleDateClick(new Date(year, month, i)));
            container.appendChild(cell);
        }
    }

    function handleDateClick(date) {
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            tempStartDate = date;
            tempEndDate = null;
        } else if (date < tempStartDate) {
            tempStartDate = date;
        } else {
            tempEndDate = date;
        }
        renderCalendars();
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const days = parseInt(e.target.dataset.range);
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days);
            tempStartDate = start;
            tempEndDate = end;
            currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
            renderCalendars();
        });
    });

    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (tempStartDate && tempEndDate) {
                startDate = tempStartDate;
                endDate = tempEndDate;
                selectedRangeText.innerText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
                dateDropdown.classList.remove('show');
            }
        });
    }

    renderCalendars();


    // ==========================================
    // 2. TAB SWITCHER LOGIC
    // ==========================================
    window.switchTab = function(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if (type === 'new') {
            const btn = document.querySelector('.tab-btn:nth-child(1)');
            if(btn) btn.classList.add('active');
        } else {
            const btn = document.querySelector('.tab-btn:nth-child(2)');
            if(btn) btn.classList.add('active');
        }
    };


    // ==========================================
    // 3. CHARTS
    // ==========================================
    
    // A. NTB ASINs Chart
    const ntbCtx = document.getElementById('ntbAsinChart');
    if (ntbCtx) {
        new Chart(ntbCtx, {
            type: 'bar',
            data: {
                labels: ['ASIN 1', 'ASIN 2', 'ASIN 3', 'ASIN 4', 'ASIN 5'],
                datasets: [{
                    label: 'Units Sold',
                    data: [1250, 980, 720, 530, 200],
                    backgroundColor: '#2563eb',
                    borderRadius: 4,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#666' } },
                    y: { beginAtZero: true, max: 1400, grid: { color: '#f0f0f0', borderDash: [5, 5] }, title: { display: true, text: 'Units Sold' } }
                }
            }
        });
    }

    // B. Revenue by Ad Product Type
    const revAdCtx = document.getElementById('revByAdProductChart');
    if (revAdCtx) {
        new Chart(revAdCtx, {
            type: 'bar',
            data: {
                labels: ['SP', 'SB', 'SD', 'DSP', 'SBv'],
                datasets: [
                    {
                        label: 'NTB Revenue',
                        data: [28500, 19200, 22000, 9500, 9500],
                        backgroundColor: '#2563eb', 
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Total Revenue',
                        data: [38000, 26000, 29000, 12500, 12500],
                        backgroundColor: '#93c5fd', 
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#666' } },
                    y: { 
                        beginAtZero: true, 
                        grid: { color: '#f0f0f0', borderDash: [5, 5] },
                        ticks: { callback: function(value) { return '₹' + value/1000 + 'k'; } }
                    }
                }
            }
        });
    }

    // C. NTB Metrics Pie Chart
    const pieCtx = document.getElementById('ntbMetricsPieChart');
    if (pieCtx) {
        const dataUsers = [1680, 920, 1450, 800]; 
        const dataUnits = [2100, 1100, 1800, 950]; 
        
        let currentPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['SP', 'SB', 'SD', 'DSP'],
                datasets: [{
                    data: dataUsers,
                    backgroundColor: ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 20 },
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } }
                }
            }
        });

        const btnUsers = document.getElementById('btnNtbUsers');
        const btnUnits = document.getElementById('btnNtbUnits');

        if(btnUsers && btnUnits) {
            btnUsers.addEventListener('click', () => {
                btnUsers.classList.add('active');
                btnUnits.classList.remove('active');
                currentPieChart.data.datasets[0].data = dataUsers;
                currentPieChart.update();
            });

            btnUnits.addEventListener('click', () => {
                btnUnits.classList.add('active');
                btnUsers.classList.remove('active');
                currentPieChart.data.datasets[0].data = dataUnits;
                currentPieChart.update();
            });
        }
    }

    // D. Revenue and Spend of NTB Campaigns (NEW CHART)
    const revSpendCtx = document.getElementById('revSpendNtbChart');
    if (revSpendCtx) {
        new Chart(revSpendCtx, {
            type: 'bar',
            data: {
                // Multi-line labels: Campaign Name + NTB Count
                labels: [
                    ['Campaign E', '85 NTBs'], 
                    ['Campaign D', '142 NTBs'], 
                    ['Campaign C', '238 NTBs'], 
                    ['Campaign B', '412 NTBs'], 
                    ['Campaign A', '568 NTBs']
                ],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [4500, 6800, 11500, 19500, 28500],
                        backgroundColor: '#10b981', // Green
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'Spend',
                        data: [1200, 1800, 3200, 5200, 7800],
                        backgroundColor: '#f59e0b', // Orange
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 25, font: { size: 12, weight: 500 } }
                    },
                    tooltip: {
                        callbacks: {
                            // Show only Campaign Name in tooltip
                            title: function(context) {
                                return Array.isArray(context[0].label) ? context[0].label[0] : context[0].label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666', font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0', borderDash: [5, 5] },
                        ticks: {
                            // Format: 30.0L
                            callback: function(value) { return '₹' + (value/1000).toFixed(1) + 'L'; },
                            color: '#999'
                        }
                    }
                }
            }
        });
    }
});