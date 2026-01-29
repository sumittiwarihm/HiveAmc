from django.shortcuts import render
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.core.serializers.json import DjangoJSONEncoder
import json
from .models import DodTable, PathToPurchaseMonthLevel, PathToPurchaseCampaignMom, AudienceOverlap,ReachFrequencyAnalysis

# Other views
def audience(request):
    return render(request, 'audience.html')
def path_analysis(request):
    return render(request, 'path_analysis.html')


# Home view



def new_and_repeat(request):
    # --- 1. Date Logic ---
    # Default to a specific range or current month logic
    end_date = date(2025, 12, 29)
    start_date = date(2025, 12, 1)
    
    req_start = request.GET.get('start')
    req_end = request.GET.get('end')

    if req_start and req_end:
        try:
            start_date = timezone.datetime.strptime(req_start, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(req_end, '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # --- 2. Base QuerySet ---
    # Get all records within the date range
    queryset = DodTable.objects.filter(date__range=[start_date, end_date])
    summary = queryset.aggregate(
        total_spends=Sum('spend', default=0),
        total_orders=Sum('purchase', default=0),
        total_revenue=Sum('sales', default=0)
    )
    # --- 3. Global Aggregations (For Denominators) ---
    # We need total sales/purchases across BOTH New and Repeat to calculate percentages (e.g., 75%)
    global_stats = queryset.aggregate(
        global_sales=Sum('sales', default=0),
        global_purchases=Sum('purchase', default=0)
    )
    
    global_sales = global_stats['global_sales'] or 0
    global_purchases = global_stats['global_purchases'] or 0

    # --- 4. Helper Function to Get Segment Data ---
    def get_segment_data(is_new_to_brand):
        # Filter by the flag
        segment_qs = queryset.filter(flagNewToBrand=is_new_to_brand)
        
        # Aggregate the required metrics
        # Note: Mapping 'Total Units Sold' to 'totalPurchase' and 'Purchase Views' to 'impression' per instructions
        summary = segment_qs.aggregate(
            revenue=Sum('sales', default=0),
            purchases=Sum('purchase', default=0),
            total_units=Sum('totalPurchase', default=0), 
            clicks=Sum('clicks', default=0),
            purchase_views=Sum('impression', default=0), 
            users_metric=Sum('impression', default=0) 
        )

        # Extract values
        rev = summary['revenue'] or 0
        purch = summary['purchases'] or 0
        
        # Calculate Percentages (Avoid Division by Zero)
        rev_percent = (rev / global_sales * 100) if global_sales > 0 else 0
        purch_percent = (purch / global_purchases * 100) if global_purchases > 0 else 0

        return {
            'revenue': "{:,.2f}".format(rev),
            'revenue_percent': "{:.1f}".format(rev_percent),
            'purchases': "{:,.0f}".format(purch),
            'purchases_percent': "{:.1f}".format(purch_percent),
            'total_units': "{:,.0f}".format(summary['total_units'] or 0),
            'clicks': "{:,.0f}".format(summary['clicks'] or 0),
            'purchase_views': "{:,.0f}".format(summary['purchase_views'] or 0),
            'users': "{:,.0f}".format(summary['users_metric'] or 0),
        }

    # --- 5. Build Context for View ---
    # Generate dictionaries for both tabs
    new_cust_data = get_segment_data(is_new_to_brand=True)
    repeat_cust_data = get_segment_data(is_new_to_brand=False)

    # --- 5. Chart Data Preparation ---
    
    # Revenue by Date for Campaign Chart
    def get_revenue_by_date(is_new_to_brand):
        segment_qs = queryset.filter(flagNewToBrand=is_new_to_brand)
        revenue_by_date = segment_qs.values('date').annotate(
            daily_revenue=Sum('totalSales')
        ).order_by('date')
        
        labels = [item['date'].strftime('%Y-%m-%d') for item in revenue_by_date]
        values = [float(item['daily_revenue']) for item in revenue_by_date]
        
        return {
            'labels': labels,
            'values': values
        }
    
    # Revenue by Ad Product Type
    def get_revenue_by_ad_type(is_new_to_brand):
        segment_qs = queryset.filter(flagNewToBrand=is_new_to_brand)
        revenue_by_type = segment_qs.values('adProductType').annotate(
            type_revenue=Sum('totalSales')
        ).order_by('-type_revenue')
        
        labels = [item['adProductType'] for item in revenue_by_type]
        values = [float(item['type_revenue']) for item in revenue_by_type]
        
        return {
            'labels': labels,
            'values': values
        }
    
    # Generate chart data for both segments
    new_campaign_data = get_revenue_by_date(True)
    new_ad_type_data = get_revenue_by_ad_type(True)
    
    repeat_campaign_data = get_revenue_by_date(False)
    repeat_ad_type_data = get_revenue_by_ad_type(False)

    context = {
        'current_start': start_date.strftime('%Y-%m-%d'),
        'current_end': end_date.strftime('%Y-%m-%d'),
        'spends': "{:,.2f}".format(summary['total_spends']),
        'orders': "{:,.0f}".format(summary['total_orders']),
        'revenue': "{:,.2f}".format(summary['total_revenue']),
        # Pass both dictionaries to the template
        # You can access them in template like {{ new_data.revenue }} or {{ repeat_data.clicks }}
        'new_data': new_cust_data,
        'repeat_data': repeat_cust_data,
        # Chart data for both segments
        'new_campaign_data': new_campaign_data,
        'new_ad_type_data': new_ad_type_data,
        'repeat_campaign_data': repeat_campaign_data,
        'repeat_ad_type_data': repeat_ad_type_data,
    }

    return render(request, 'new_and_repeat.html', context)

def home(request):
    # --- 1. Date Logic ---
    end_date = date(2025, 12, 29)
    start_date = date(2025, 12, 1)
    
    req_start = request.GET.get('start')
    req_end = request.GET.get('end')

    if req_start and req_end:
        try:
            start_date = timezone.datetime.strptime(req_start, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(req_end, '%Y-%m-%d').date()
        except ValueError:
            pass 

    # --- 2. Queryset Filtering --- lazy loading
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

def reach_and_frequency(request):

    # --- 1. Date Logic ---

    start_date = date(2025, 1, 1)
    end_date = date(2026, 12, 29)

    req_start = request.GET.get('start')
    req_end = request.GET.get('end')

    if req_start and req_end:
        try:
            start_date = timezone.datetime.strptime(req_start, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(req_end, '%Y-%m-%d').date()
        except ValueError:
            pass

    # --- 2. Summary Data (DodTable) ---
    summary_queryset = DodTable.objects.filter(date__range=[start_date, end_date])
    summary = summary_queryset.aggregate(
        total_spends=Sum('spend', default=0),
        total_orders=Sum('purchase', default=0),
        total_revenue=Sum('sales', default=0)
    )

    # --- 3. GENERATE STRING KEYS (Format: "1-2025", "11-2025") ---
    month_keys = []
    current_date = start_date.replace(day=1)

    while current_date <= end_date:
        # --- FIX IS HERE ---
        # Using current_date.month gives 1, 2, ... 11, 12 (No leading zero)
        key = f"{current_date.month}-{current_date.year}"
        month_keys.append(key)

        # Increment Month

        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)

    # --- 4. Chart Data ---
    # chart_queryset = ReachFrequencyAnalysis.objects.filter(
    #     monthYear__in=month_keys
    # ).values('frequency').annotate(
    #     total_reach=Sum('reach'),
    #     total_purchases=Sum('purchases'),
    #     total_impressions=Sum('impressions')
    # )
    chart_data = list(ReachFrequencyAnalysis.objects.filter(
    monthYear__in=month_keys
    ).values('frequency').annotate(
        total_reach=Sum('reach'),
        total_purchases=Sum('purchases'),
        total_impressions=Sum('impressions')
    ))
    chart_data.sort(key=lambda x: int(str(x['frequency']).replace('+', '')))

    chart_labels = []
    chart_unique_users = []
    chart_conversion_rate = []
    chart_conv_rate_imp = []

    total_users_accumulated = 0
    total_conversion_accumulated = 0
    count_items = 0

    for entry in chart_data:
        freq = str(entry['frequency'])
        reach = float(entry['total_reach'] or 0)
        impression = float(entry['total_impressions'] or 0)
        purchases = float(entry['total_purchases'] or 0)

        conversion = 0.0

        if reach > 0:
            conversion = round((purchases / reach) * 100, 2) 
        chart_labels.append(freq)
        chart_unique_users.append(reach)
        chart_conversion_rate.append(conversion)

        #code by me#######
        imp_conversion = 0.0
        if impression > 0:
            imp_conversion = round((purchases / impression) * 100, 2)  
        # chart_labels_imp.append(freq)
        
        chart_conv_rate_imp.append(imp_conversion) 
        #code by me#######


        total_users_accumulated += reach
        
        total_conversion_accumulated += conversion
        count_items += 1

    # --- 5. Averages ---
    avg_unique_users = 0
    avg_conversion_rate = 0.0

    if count_items > 0:
        avg_unique_users = int(total_users_accumulated / count_items)
        avg_conversion_rate = round(total_conversion_accumulated / count_items, 2)



    context = {
        'current_start': start_date.strftime('%Y-%m-%d'),
        'current_end': end_date.strftime('%Y-%m-%d'),

        'spends': "{:,.2f}".format(summary['total_spends'] or 0),
        'orders': "{:,.0f}".format(summary['total_orders'] or 0),
        'revenue': "{:,.2f}".format(summary['total_revenue'] or 0),

        'chart_labels': json.dumps(chart_labels),
        'chart_users': json.dumps(chart_unique_users),
        'chart_conversion': json.dumps(chart_conversion_rate),
        'chart_conv_rate_imp': json.dumps(chart_conv_rate_imp),
        'avg_unique_users': "{:,}".format(avg_unique_users),
        'avg_conversion_rate': "{}%".format(avg_conversion_rate),
    }
    return render(request, 'audience.html', context)

from collections import defaultdict
from datetime import date, timedelta
from django.db.models import Sum
from django.shortcuts import render
import json

from .models import AudienceOverlap, DodTable


# ---------------------------------------
# HELPERS
# ---------------------------------------

def classify_exposure(exposure_group: str):
    eg = (exposure_group or "").lower()

    has_dsp = "dsp" in eg
    has_search = any(k in eg for k in [
        "sponsored_products",
        "sponsored_brands",
        "sponsored_display"
    ])

    if has_dsp and has_search:
        return "overlap"
    elif has_dsp:
        return "dsp"
    else:
        return "search"


def default_bucket():
    return {"users": 0.0, "conversions": 0.0}


def rate(bucket):
    users = bucket["users"]
    conv = bucket["conversions"]

    if users == 0:
        return "0%"

    val = (conv / users * 100)

    # If value is below 0.1%, show with 4 decimals
    if val < 0.1:
        return f"{val:.4f}%"

    # Otherwise normal 1-decimal format
    return f"{val:.1f}%"



# Convert "MM-YYYY" → 202501
def parse_monthyear(text):
    try:
        mm, yyyy = text.split("-")
        return int(yyyy + mm)  # "2025" + "01" → 202501
    except:
        return 0


# ---------------------------------------
# MAIN VIEW
# ---------------------------------------

from django.shortcuts import render
from django.db.models import Sum
from datetime import date, datetime, timedelta
from collections import defaultdict
import json

def ad_overlap(request):
    # --- 1. TOP SUMMARY CARD FILTER ---
    req_start = request.GET.get("start")
    req_end = request.GET.get("end")

    if req_start and req_end:
        start_date = datetime.strptime(req_start, "%Y-%m-%d").date()
        end_date = datetime.strptime(req_end, "%Y-%m-%d").date()
    else:
        end_date = date(2025, 1, 2)
        start_date = date(2025, 12, 1)

    summary_qs = DodTable.objects.filter(date__range=[start_date, end_date])
    summary = summary_qs.aggregate(
        total_spends=Sum("spend", default=0),
        total_orders=Sum("purchase", default=0),
        total_revenue=Sum("sales", default=0),
    )

    # --- 2. OVERLAP SELECTION LOGIC ---
    # Default to 'range' mode if nothing is selected
    filter_mode = request.GET.get("filter_mode", "range") 
    overlap_range = request.GET.get("overlap_range", "all")
    selected_month = request.GET.get("selected_month", "") 
    
    available_months = AudienceOverlap.objects.values_list('monthYear', flat=True).distinct().order_by('-monthYear')
    overlap_all = AudienceOverlap.objects.all()
    overlap_qs = []

    # Priority Filtering
    if filter_mode == "month" and selected_month:
        overlap_qs = [row for row in overlap_all if row.monthYear == selected_month]
    else:
        # Range logic (default)
        today = date.today()
        if overlap_range == "last30":
            overlap_start = today - timedelta(days=30)
        elif overlap_range == "last60":
            overlap_start = today - timedelta(days=60)
        elif overlap_range == "last90":
            overlap_start = today - timedelta(days=90)
        else:
            overlap_start = date(2000, 1, 1)  

        start_key = int(overlap_start.strftime("%Y%m"))
        end_key = int(today.strftime("%Y%m"))
        overlap_qs = [
            row for row in overlap_all
            if start_key <= parse_monthyear(row.monthYear) <= end_key
        ]

    # --- 3. BUILD DATA FOR NEW/REPEAT ---
    data = { "new": defaultdict(default_bucket), "repeat": defaultdict(default_bucket) }
    for row in overlap_qs:
        cohort = "new" if row.flagNewToBrand else "repeat"
        bucket = classify_exposure(row.exposureGroup)
        data[cohort][bucket]["users"] += float(row.uniqueReach or 0)
        data[cohort][bucket]["conversions"] += float(row.purchases or 0)

    overlap_context = {}
    for cohort in ["new", "repeat"]:
        s, d, o = data[cohort]["search"], data[cohort]["dsp"], data[cohort]["overlap"]
        overlap_context[cohort] = {
            "search": rate(s), "dsp": rate(d), "overlap": rate(o),
            "searchSub": f"{int(s['users']):,} users · {int(s['conversions']):,} conversions",
            "dspSub": f"{int(d['users']):,} users · {int(d['conversions']):,} conversions",
            "overlapSub": f"{int(o['users']):,} users · {int(o['conversions']):,} conversions",
            "insight": f"{cohort.title()} customers show {rate(o)} cross-channel overlap."
        }

    context = {
        "current_start": start_date.strftime("%Y-%m-%d"),
        "current_end": end_date.strftime("%Y-%m-%d"),
        "spends": "{:,.2f}".format(summary["total_spends"]),
        "orders": "{:,.0f}".format(summary["total_orders"]),
        "revenue": "{:,.2f}".format(summary["total_revenue"]),
        "filter_mode": filter_mode,
        "overlap_range": overlap_range,
        "selected_month": selected_month,
        "available_months": available_months,
        "overlap_data": json.dumps(overlap_context),
    }
    return render(request, "ad_overlap.html", context)