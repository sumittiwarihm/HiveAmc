document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DATE PICKER LOGIC ---
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const selectedRangeText = document.getElementById('selectedRangeText');
    const applyDateBtn = document.getElementById('applyDateBtn');
    
    // Default State
    let currentDate = new Date(2025, 11, 1); // December 2025
    let startDate = new Date(2025, 10, 18); // Nov 18
    let endDate = new Date(2025, 11, 18);   // Dec 18
    
    // Temp variables for selection (before user clicks Apply)
    let tempStartDate = startDate;
    let tempEndDate = endDate;

    // --- KEY FIX: EVENT HANDLERS ---

    // 1. Open/Close on Trigger Click
    dateTrigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger the document close logic
        dateDropdown.classList.toggle('show');
        renderCalendars();
    });

    // 2. Prevent Dropdown from closing when clicking INSIDE it
    // This fixes the issue where clicking a date (which re-renders the grid) caused it to close
    dateDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 3. Close ONLY when clicking OUTSIDE the dropdown
    document.addEventListener('click', () => {
        dateDropdown.classList.remove('show');
    });


    // --- CALENDAR RENDERING & LOGIC ---

    // Navigation Buttons
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendars();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendars();
    });

    // Helper: Format Date
    function formatDate(d) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    }

    // Render Function
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
        
        // Month Names
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        label.innerText = `${monthNames[month]} ${year}`;

        container.innerHTML = '';

        // Day Headers (Su, Mo, etc.)
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(d => {
            const el = document.createElement('div');
            el.className = 'day-name';
            el.innerText = d;
            container.appendChild(el);
        });

        // Blank spaces before the 1st of the month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'day-cell empty';
            container.appendChild(empty);
        }

        // Render Dates
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.innerText = i;

            // Highlight Logic
            const tStart = tempStartDate ? new Date(tempStartDate).setHours(0,0,0,0) : null;
            const tEnd = tempEndDate ? new Date(tempEndDate).setHours(0,0,0,0) : null;
            const current = dateObj.setHours(0,0,0,0);

            if (current === tStart) cell.classList.add('selected', 'range-start');
            if (current === tEnd) cell.classList.add('selected', 'range-end');
            
            if (tStart && tEnd && current > tStart && current < tEnd) {
                cell.classList.add('in-range');
            }

            // Click Event for Day Cell
            cell.addEventListener('click', () => handleDateClick(new Date(year, month, i)));
            
            container.appendChild(cell);
        }
    }

    function handleDateClick(date) {
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            // Start a new selection
            tempStartDate = date;
            tempEndDate = null;
        } else if (date < tempStartDate) {
            // User clicked a date before the start date -> Reset start
            tempStartDate = date;
        } else {
            // User clicked end date
            tempEndDate = date;
        }
        renderCalendars();
    }

    // Preset Buttons (Last 7 days, etc.)
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const days = parseInt(e.target.dataset.range);
            const end = new Date(); 
            const start = new Date();
            start.setDate(end.getDate() - days);
            
            tempStartDate = start;
            tempEndDate = end;
            
            // Move calendar view to start date
            currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
            renderCalendars();
        });
    });

    // Apply Button
    applyDateBtn.addEventListener('click', () => {
        if(tempStartDate && tempEndDate) {
            startDate = tempStartDate;
            endDate = tempEndDate;
            selectedRangeText.innerText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
            
            // Manually close the dropdown since we stopped propagation
            dateDropdown.classList.remove('show');
            
            // Here you would typically trigger an API fetch to update charts
            console.log("Date Range Applied:", startDate, endDate);
        }
    });

    // Initial Render call
    renderCalendars();


    // --- 2. CHARTS CONFIGURATION (Unchanged) ---
    const labels = ["Nov 18", "Nov 22", "Nov 25", "Nov 28", "Dec 1", "Dec 5", "Dec 10", "Dec 15", "Dec 18"];
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
            y: { border: { dash: [4, 4] }, grid: { color: '#f0f0f0', borderDash: [5, 5] }, ticks: { font: { size: 10 }, color: '#999' }, beginAtZero: true }
        },
        elements: { line: { tension: 0.1 }, point: { radius: 4, backgroundColor: 'white', borderWidth: 2 } }
    };

    new Chart(document.getElementById('spendsChart'), {
        type: 'line', data: { labels: labels, datasets: [{ data: [4000, 5000, 4500, 6000, 4800, 5500, 5000, 6500, 7000], borderColor: '#2563eb', backgroundColor: '#2563eb', pointBackgroundColor: '#2563eb', borderWidth: 2 }] }, options: commonOptions
    });
    new Chart(document.getElementById('ordersChart'), {
        type: 'line', data: { labels: labels, datasets: [{ data: [195, 160, 200, 165, 220, 190, 240, 250, 230], borderColor: '#f97316', backgroundColor: '#f97316', pointBackgroundColor: '#f97316', borderWidth: 2 }] }, options: commonOptions
    });
    new Chart(document.getElementById('revenueChart'), {
        type: 'line', data: { labels: labels, datasets: [{ data: [32000, 33000, 31000, 41000, 44000, 35000, 45000, 46000, 40000], borderColor: '#10b981', backgroundColor: '#10b981', pointBackgroundColor: '#10b981', borderWidth: 2 }] }, options: commonOptions
    });
});