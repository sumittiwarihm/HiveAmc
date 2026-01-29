from django.db import models

class DodTable(models.Model):
    account = models.CharField(max_length=255) 
    analysisType = models.CharField(max_length=255)
    date = models.DateField()
    adProductType = models.CharField(max_length=255)
    userPurchased = models.DecimalField(max_digits=20, decimal_places=2,default=None)
    impression = models.DecimalField(max_digits=20, decimal_places=2)
    clicks = models.DecimalField(max_digits=20, decimal_places=2)
    spend = models.DecimalField(max_digits=20, decimal_places=2)
    purchase = models.DecimalField(max_digits=20, decimal_places=2)
    sales = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchase = models.DecimalField(max_digits=20, decimal_places=2)
    totalSales = models.DecimalField(max_digits=20, decimal_places=2)
    # Changed to BooleanField
    flagNewToBrand = models.BooleanField(db_index=True)

    def __str__(self):
        return f"{self.account} - {self.date} ({'New-to-Brand' if self.flagNewToBrand else 'Repeat'})"


class PathToPurchaseMonthLevel(models.Model):
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
    # Changed to BooleanField
    flagNewToBrand = models.BooleanField(db_index=True)

    def __str__(self):
        return f"{self.account} - {self.monthYear} ({'New-to-Brand' if self.flagNewToBrand else 'Repeat'})"


class PathToPurchaseCampaignMom(models.Model):
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
    # Changed to BooleanField
    flagNewToBrand = models.BooleanField(db_index=True)

    def __str__(self):
        return f"{self.account} - {self.monthYear} ({'New-to-Brand' if self.flagNewToBrand else 'Repeat'})"


class AudienceOverlap(models.Model):
    account = models.CharField(max_length=255) 
    exposureGroup = models.CharField(max_length=255)
    monthYear = models.CharField(max_length=255)
    medianDayToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    medianHourToConversion = models.DecimalField(max_digits=20, decimal_places=2)
    uniqueReach = models.DecimalField(max_digits=20, decimal_places=2)
    userPurchased = models.DecimalField(max_digits=20, decimal_places=2)
    purchases = models.DecimalField(max_digits=20, decimal_places=2)
    sales = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchases = models.DecimalField(max_digits=20, decimal_places=2)
    totalSales = models.DecimalField(max_digits=20, decimal_places=2)
    # Changed to BooleanField
    flagNewToBrand = models.BooleanField(db_index=True)

    def __str__(self):
        return f"{self.account} - {self.monthYear} ({'New-to-Brand' if self.flagNewToBrand else 'Repeat'})"
    
class ReachFrequencyAnalysis(models.Model):
    account = models.CharField(max_length=255)
    monthYear = models.CharField(max_length=255)
    frequency = models.CharField(max_length=255)
    reach = models.DecimalField(max_digits=20, decimal_places=2)
    impressions = models.DecimalField(max_digits=20, decimal_places=2)
    purchases = models.DecimalField(max_digits=20, decimal_places=2)
    totalPurchases = models.DecimalField(max_digits=20, decimal_places=2)

    def __str__(self):
        return f"{self.account} - {self.monthYear}"
    