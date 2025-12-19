from django.shortcuts import render
from django.shortcuts import render
from django.db.models import Sum
from django.db.models.functions import TruncDate
from datetime import timedelta
from django.utils import timezone
from .models import DodTable
import json

def new_and_repeat(request):
    return render(request, 'new_and_repeat.html')
def audience(request):
    return render(request, 'audience.html')
def path_analysis(request):
    return render(request, 'path_analysis.html')
def ad_overlap(request):
    return render(request, 'ad_overlap.html')
def home(request):
    """
    Renders the Home Dashboard with Summary Cards and Trend Charts.
    """

    # --- 1. Date Filtering Logic ---
    # Default to 'Last 30 Days' if no date is provided
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)

    # Check if 'start' and 'end' query params exist (e.g., ?start=2025-11-01&end=2025-11-30)
    req_start = request.GET.get('start')
    req_end = request.GET.get('end')

    if req_start and req_end:
        try:
            start_date = timezone.datetime.strptime(req_start, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(req_end, '%Y-%m-%d').date()
        except ValueError:
            pass # Fallback to default if format is wrong

    # Filter QuerySet based on date range
    queryset = DodTable.objects.filter(date__range=[start_date, end_date])

    # --- 2. Calculate Summary Totals (Cards) ---
    summary = queryset.aggregate(
        total_spends=Sum('spend'),
        total_orders=Sum('purchase'), # Assuming 'purchase' = Orders
        total_revenue=Sum('sales')
    )

    # Handle None values if no data exists
    spends = summary['total_spends'] or 0
    orders = summary['total_orders'] or 0
    revenue = summary['total_revenue'] or 0

    # --- 3. Prepare Trend Data (Charts) ---
    # Group by Date and Sum values
    trend_data = queryset.annotate(day=TruncDate('date')).values('day').annotate(
        daily_spend=Sum('spend'),
        daily_orders=Sum('purchase'),
        daily_revenue=Sum('sales')
    ).order_by('day')

    # Arrays for Chart.js
    labels = []
    data_spends = []
    data_orders = []
    data_revenue = []

    for entry in trend_data:
        # Format date as 'Nov 18' for chart labels
        labels.append(entry['day'].strftime('%b %d'))
        data_spends.append(float(entry['daily_spend'] or 0))
        data_orders.append(float(entry['daily_orders'] or 0))
        data_revenue.append(float(entry['daily_revenue'] or 0))

    # Context to pass to template
    context = {
        # Summary Values (Formatted for display)
        'spends': "{:,.0f}".format(spends),
        'orders': "{:,.0f}".format(orders),
        'revenue': "{:,.0f}".format(revenue),
        
        # Chart Data (Converted to JSON for JS)
        'chart_labels': json.dumps(labels),
        'chart_spends': json.dumps(data_spends),
        'chart_orders': json.dumps(data_orders),
        'chart_revenue': json.dumps(data_revenue),
        
        # Current selection state (for date picker UI)
        'current_start': start_date.strftime('%Y-%m-%d'),
        'current_end': end_date.strftime('%Y-%m-%d'),
        'display_date_range': f"{start_date.strftime('%b %d, %Y')} - {end_date.strftime('%b %d, %Y')}"
    }

    return render(request, 'home.html', context)