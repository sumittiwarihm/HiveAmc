from django.shortcuts import render
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.core.serializers.json import DjangoJSONEncoder
import json
from .models import DodTable 

# Other views
def new_and_repeat(request):
    return render(request, 'new_and_repeat.html')
def audience(request):
    return render(request, 'audience.html')
def path_analysis(request):
    return render(request, 'path_analysis.html')
def ad_overlap(request):
    return render(request, 'ad_overlap.html')

# Home view
def home(request):
    # --- 1. Date Logic ---
    end_date = date(2024, 5, 25)
    start_date = date(2024, 1, 2)
    
    req_start = request.GET.get('start')
    req_end = request.GET.get('end')

    if req_start and req_end:
        try:
            start_date = timezone.datetime.strptime(req_start, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(req_end, '%Y-%m-%d').date()
        except ValueError:
            pass 

    # --- 2. Queryset Filtering ---
    queryset = DodTable.objects.filter(date__range=[start_date, end_date])

    # --- 3. Aggregation ---
    summary = queryset.aggregate(
        total_spends=Sum('spend', default=0),
        total_orders=Sum('purchase', default=0),
        total_revenue=Sum('sales', default=0)
    )

    # --- 4. Trend Data ---
    trend_data = queryset.annotate(day=TruncDate('date')) \
                         .values('day') \
                         .annotate(
                             daily_spend=Sum('spend', default=0),
                             daily_orders=Sum('purchase', default=0),
                             daily_revenue=Sum('sales', default=0)
                         ).order_by('day')

    labels, data_spends, data_orders, data_revenue = [], [], [], []
    for entry in trend_data:
        labels.append(entry['day'].strftime('%b %d'))
        data_spends.append(float(entry['daily_spend']))
        data_orders.append(float(entry['daily_orders']))
        data_revenue.append(float(entry['daily_revenue']))

    context = {
        'spends': "{:,.2f}".format(summary['total_spends']),
        'orders': "{:,.0f}".format(summary['total_orders']),
        'revenue': "{:,.2f}".format(summary['total_revenue']),
        'chart_labels': json.dumps(labels, cls=DjangoJSONEncoder),
        'chart_spends': json.dumps(data_spends, cls=DjangoJSONEncoder),
        'chart_orders': json.dumps(data_orders, cls=DjangoJSONEncoder),
        'chart_revenue': json.dumps(data_revenue, cls=DjangoJSONEncoder),
        'display_date_range': f"{start_date.strftime('%b %d, %Y')} - {end_date.strftime('%b %d, %Y')}",
        'current_start': start_date.strftime('%Y-%m-%d'),
        'current_end': end_date.strftime('%Y-%m-%d'),
    }
    
    return render(request, 'home.html', context)