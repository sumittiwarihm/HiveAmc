document.addEventListener('DOMContentLoaded', () => {
    console.log("New & Repeat Analysis Script Loaded");

    // ==========================================
    // 1. CHART GENERATION LOGIC
    // ==========================================

    // Check if data exists
    if (typeof chartData === 'undefined') {
        console.warn("No 'chartData' found. Charts will not render.");
    } else {
        // --- Chart 1: NTB ASINs ---
        const asinCtx = document.getElementById('topAsinChart');
        if (asinCtx) {
            new Chart(asinCtx, {
                type: 'bar',
                data: {
                    labels: chartData.asin.labels,
                    datasets: [{
                        label: 'Units Sold',
                        data: chartData.asin.data,
                        backgroundColor: '#2962ff',
                        borderRadius: 4,
                        barPercentage: 0.5,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [5, 5], drawBorder: false } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // --- Chart 2: Revenue vs Spend ---
        const campaignCtx = document.getElementById('ntbCampaignChart');
        if (campaignCtx) {
            new Chart(campaignCtx, {
                type: 'bar',
                data: {
                    labels: chartData.campaigns.labels,
                    datasets: [
                        { label: 'Revenue', data: chartData.campaigns.revenue, backgroundColor: '#00b894', borderRadius: 4 },
                        { label: 'Spend', data: chartData.campaigns.spend, backgroundColor: '#f39c12', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { borderDash: [5, 5], drawBorder: false },
                            ticks: { callback: (val) => val === 0 ? '₹0' : '₹' + (val / 100000).toFixed(1) + 'L' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // --- Chart 3: Ad Type (Dual Axis) ---
        const adTypeCtx = document.getElementById('adTypeChart');
        if (adTypeCtx) {
            new Chart(adTypeCtx, {
                type: 'bar',
                data: {
                    labels: chartData.adTypes.labels,
                    datasets: [
                        { label: 'NTB Revenue', data: chartData.adTypes.revenue, backgroundColor: '#4285F4', yAxisID: 'y', borderRadius: 4 },
                        { label: 'NTB Units', data: chartData.adTypes.units, backgroundColor: '#FBBC04', yAxisID: 'y1', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false } },
                        y: { 
                            type: 'linear', position: 'left', beginAtZero: true,
                            ticks: { callback: (val) => val === 0 ? '₹0' : '₹' + (val / 100000).toFixed(1) + 'L' },
                            title: { display: true, text: 'Revenue' }
                        },
                        y1: { 
                            type: 'linear', position: 'right', beginAtZero: true, grid: { display: false },
                            title: { display: true, text: 'Units' }
                        }
                    }
                }
            });
        }
    }

    // ==========================================
    // 2. TAB SWITCHING LOGIC (METRICS)
    // ==========================================

    const tabs = document.querySelectorAll('.tab-btn');
    
    // Helper function to update text on screen
    function updateMetrics(type) {
        if (typeof dashboardData === 'undefined') {
            console.error("dashboardData is not defined.");
            return;
        }

        const data = dashboardData[type];
        if (!data) return;

        // Update Metric Values based on IDs
        const map = {
            'd-revenue': '₹' + data.revenue,
            'd-rev-percent': data.revPercent + '%',
            'd-purchases': data.purchases,
            'd-purch-percent': data.purchPercent + '%',
            'd-units': data.units,
            'd-clicks': data.clicks,
            'd-views': data.views,
            'd-users': data.users
        };

        for (const [id, value] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
    }

    // Add Click Event Listeners
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 1. Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                
                // 2. Add active class to clicked
                this.classList.add('active');

                // 3. Determine type ('new' or 'repeat') based on button ID
                let type = 'new'; // Default
                if (this.id === 'btn-repeat') {
                    type = 'repeat';
                }

                // 4. Update the dashboard numbers
                updateMetrics(type);
            });
        });
    }
});