document.addEventListener('DOMContentLoaded', () => {
    console.log("Path Analysis Script Loaded");

    // ==========================================
    // 1. DATE PICKER LOGIC (Standard)
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
    // 2. TOGGLE FILTER LOGIC (New/Repeat)
    // ==========================================
    const btnNew = document.getElementById('btnNewCust');
    const btnRepeat = document.getElementById('btnRepeatCust');

    if (btnNew && btnRepeat) {
        btnNew.addEventListener('click', () => {
            btnNew.classList.add('active');
            btnRepeat.classList.remove('active');
            // Logic to filter table for New Customers
            console.log("Showing New Customers Path");
        });

        btnRepeat.addEventListener('click', () => {
            btnRepeat.classList.add('active');
            btnNew.classList.remove('active');
            // Logic to filter table for Repeat Customers
            console.log("Showing Repeat Customers Path");
        });
    }

});