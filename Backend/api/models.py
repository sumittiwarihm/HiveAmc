from django.db import models
from django.db import models

class DodTable(models.Model):
    TYPE_CHOICES = [
        ('New-to-Brand', 'New-to-Brand'),
        ('Repeat', 'Repeat'),
    ]
    account = models.CharField(max_length=255) 
    analysisType = models.CharField(max_length=255)
    date = models.DateField()
    adProductType = models.CharField(max_length=255)
    impression = models.DecimalField(max_digits=20, decimal_places=2)
    clicks = models.DecimalField(max_digits=20, decimal_places=2)
    spend = models.DecimalField(max_digits=20, decimal_places=2)
    purchase = models.DecimalField(max_digits=20, decimal_places=2)
    sales = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchase = models.DecimalField(max_digits=20, decimal_places=2)
    totalSales = models.DecimalField(max_digits=20, decimal_places=2)
    flagNewToBrand = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        db_index=True
    )

    def __str__(self):
        return f"{self.account} - {self.date} ({self.flagNewToBrand})"


from django.db import models

class PathToPurchaseMonthLevel(models.Model):
    TYPE_CHOICES = [
        ('New-to-Brand', 'New-to-Brand'),
        ('Repeat', 'Repeat'),
    ]
    account = models.CharField(max_length=255) 
    analysisType = models.CharField(max_length=255)
    monthYear = models.CharField(max_length=255)
    path = models.CharField(max_length=255)
    medianDayToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    medianHourToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    pathOccurence = models.DecimalField(max_digits=20, decimal_places=2)
    impression = models.DecimalField(max_digits=20, decimal_places=2)
    userPurchased = models.DecimalField(max_digits=20, decimal_places=2)
    spend = models.DecimalField(max_digits=20, decimal_places=2)
    purchase = models.DecimalField(max_digits=20, decimal_places=2)
    sales = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchase = models.DecimalField(max_digits=20, decimal_places=2)
    totalSales = models.DecimalField(max_digits=20, decimal_places=2)
    flagNewToBrand = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        db_index=True
    )

    def __str__(self):
        return f"{self.account} - {self.monthYear} ({self.flagNewToBrand})"
    

class PathToPurchaseCampaignMom(models.Model):
    TYPE_CHOICES = [
        ('New-to-Brand', 'New-to-Brand'),
        ('Repeat', 'Repeat'),
    ]
    account = models.CharField(max_length=255) 
    path = models.CharField(max_length=255)
    monthYear = models.CharField(max_length=255)
    campaignId = models.CharField(max_length=255)
    campaignName = models.CharField(max_length=255)
    medianDayToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    medianHourToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    pathOccurence = models.DecimalField(max_digits=20, decimal_places=2)
    impression = models.DecimalField(max_digits=20, decimal_places=2)
    spend = models.DecimalField(max_digits=20, decimal_places=2)
    userPurchased = models.DecimalField(max_digits=20, decimal_places=2)
    sales = models.DecimalField(max_digits=20, decimal_places=2)
    purchase = models.DecimalField(max_digits=20, decimal_places=2)
    totalSales = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchase = models.DecimalField(max_digits=20, decimal_places=2)
    flagNewToBrand = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        db_index=True
    )

    def __str__(self):
        return f"{self.account} - {self.monthYear} ({self.flagNewToBrand})"
    

class AudienceOverlap(models.Model):
    TYPE_CHOICES = [
        ('New-to-Brand', 'New-to-Brand'),
        ('Repeat', 'Repeat'),
    ]
    account = models.CharField(max_length=255) 
    exposureGroup=models.CharField(max_length=255)
    monthYear=models.CharField(max_length=255)
    medianDayToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    medianHourToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    uniqueReach=models.DecimalField(max_digits=20, decimal_places=2)
    userPurchased=models.DecimalField(max_digits=20, decimal_places=2)
    purchases=models.DecimalField(max_digits=20, decimal_places=2)
    sales=models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchases=models.DecimalField(max_digits=20, decimal_places=2)
    totalSales=models.DecimalField(max_digits=20, decimal_places=2)
    flagNewToBrand = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        db_index=True
    )
    def __str__(self):
        return f"{self.account} - {self.monthYear} ({self.flagNewToBrand})"

