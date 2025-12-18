document.addEventListener('DOMContentLoaded', () => {
    console.log("Audience & Reach Script Loaded");

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
    // 2. AUDIENCE CHART: Mixed (Bar + Line)
    // ==========================================
    const ctx = document.getElementById('audienceReachChart');
    if (ctx) {
        
        // Mock Data to match screenshot pattern
        const labels = ['Nov 18', 'Nov 21', 'Nov 24', 'Nov 27', 'Nov 30', 'Dec 3', 'Dec 6', 'Dec 9', 'Dec 12', 'Dec 15', 'Dec 18'];
        const uniqueUsersData = [120000, 135000, 110000, 145000, 150000, 130000, 125000, 140000, 155000, 160000, 145000]; // Teal Bars
        const conversionData = [2.5, 3.2, 2.8, 4.1, 4.5, 3.8, 3.5, 4.0, 4.8, 5.2, 4.5]; // Yellow Line

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Number of Unique Users',
                        data: uniqueUsersData,
                        backgroundColor: '#10b981', // Teal Color
                        borderRadius: 4,
                        barPercentage: 0.5,
                        order: 2, // Layer behind line
                        yAxisID: 'y' // Left Axis
                    },
                    {
                        label: 'Impression to Conversion (%)',
                        data: conversionData,
                        type: 'line', // Mixed Chart Type
                        borderColor: '#f59e0b', // Yellow Color
                        backgroundColor: '#f59e0b',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#f59e0b',
                        tension: 0.3, // Smooth curve
                        order: 1, // Layer on top
                        yAxisID: 'y1' // Right Axis
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666', font: { size: 11 } }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: '#f0f0f0', borderDash: [5, 5] },
                        ticks: { color: '#999', stepSize: 35000 },
                        title: { display: false } // Axis title implied by legend
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 8, // Adjust based on % data
                        grid: { display: false }, // Hide grid for right axis for cleaner look
                        ticks: { color: '#999' }
                    }
                }
            }
        });
    }

});