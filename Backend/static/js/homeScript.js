
function getdate(){
    const today = new Date();

const formattedDate = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: '2-digit',
  year: 'numeric'
});
return formattedDate;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Home Script Loaded");
    document.getElementById('Greetingdate').innerText = getdate();
    // 1. Check if data exists
    if (typeof chartData === 'undefined' || chartData.labels.length === 0) {
        console.warn("No data found for charts in this date range.");
        return; 
    }

    const labels = chartData.labels;
    const spendsData = chartData.spends;
    const ordersData = chartData.orders;
    const revenueData = chartData.revenue;

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
            y: { border: { dash: [4, 4] }, grid: { color: '#f0f0f0' }, ticks: { font: { size: 10 }, color: '#999' }, beginAtZero: true }
        },
        elements: { line: { tension: 0.1 }, point: { radius: 4, backgroundColor: 'white', borderWidth: 2 } }
    };

    // Initialize Spends Chart
    const spendsCtx = document.getElementById('spendsChart');
    if (spendsCtx) {
        new Chart(spendsCtx, {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ data: spendsData, borderColor: '#2563eb', backgroundColor: '#2563eb', pointBackgroundColor: '#2563eb', borderWidth: 2 }] 
            }, 
            options: commonOptions
        });
    }

    // Initialize Orders Chart
    const ordersCtx = document.getElementById('ordersChart');
    if (ordersCtx) {
        new Chart(ordersCtx, {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ data: ordersData, borderColor: '#f97316', backgroundColor: '#f97316', pointBackgroundColor: '#f97316', borderWidth: 2 }] 
            }, 
            options: commonOptions
        });
    }

    // Initialize Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line', 
            data: { 
                labels: labels, 
                datasets: [{ data: revenueData, borderColor: '#10b981', backgroundColor: '#10b981', pointBackgroundColor: '#10b981', borderWidth: 2 }] 
            }, 
            options: commonOptions
        });
    }
});


