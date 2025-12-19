document.addEventListener('DOMContentLoaded', () => {
    console.log("Home Script Loaded");

    // ... (Your Date Picker Logic stays here) ...

    // ==========================================
    // 2. HOME PAGE CHARTS
    // ==========================================
    const spendsCtx = document.getElementById('spendsChart');
    
    // CHECK: Use Django data if available, otherwise empty array
    const labels = typeof chartData !== 'undefined' ? chartData.labels : [];
    const spendsData = typeof chartData !== 'undefined' ? chartData.spends : [];
    const ordersData = typeof chartData !== 'undefined' ? chartData.orders : [];
    const revenueData = typeof chartData !== 'undefined' ? chartData.revenue : [];

    if (spendsCtx) {
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

        // SPENDS CHART
        new Chart(spendsCtx, {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: spendsData, // Using Django Data
                    borderColor: '#2563eb', 
                    backgroundColor: '#2563eb', 
                    pointBackgroundColor: '#2563eb', 
                    borderWidth: 2 
                }] 
            }, 
            options: commonOptions
        });

        // ORDERS CHART
        new Chart(document.getElementById('ordersChart'), {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: ordersData, // Using Django Data
                    borderColor: '#f97316', 
                    backgroundColor: '#f97316', 
                    pointBackgroundColor: '#f97316', 
                    borderWidth: 2 
                }] 
            }, 
            options: commonOptions
        });

        // REVENUE CHART
        new Chart(document.getElementById('revenueChart'), {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: revenueData, // Using Django Data
                    borderColor: '#10b981', 
                    backgroundColor: '#10b981', 
                    pointBackgroundColor: '#10b981', 
                    borderWidth: 2 
                }] 
            }, 
            options: commonOptions
        });
    }
});