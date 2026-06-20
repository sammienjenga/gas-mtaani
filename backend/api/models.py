import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta, timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager

# --- 1. CUSTOM USER MANAGER ---
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# --- 2. CUSTOM USER MODEL ---
class User(AbstractUser):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    email = models.EmailField(unique=True)

    is_verified = models.BooleanField(default=False) 
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'  
    REQUIRED_FIELDS = ['username', 'full_name'] 

    def __str__(self):
        return f"{self.full_name} ({self.role})"


# --- 3. PRODUCT MODEL (Updated for 24H Deals) ---
class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="General")
    brand = models.CharField(max_length=100, blank=True, null=True) 
    weight = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)      
    stock = models.IntegerField(default=0)      
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # 24-Hour Deal Fields (deal_date handled automatically by serializer)
    is_deal = models.BooleanField(default=False)
    deal_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deal_date = models.DateField(null=True, blank=True)  
    deal_start_time = models.TimeField(null=True, blank=True) 
    deal_end_time = models.TimeField(null=True, blank=True)   

    @property
    def is_deal_active(self):
        """
        Calculates if the deal is live automatically. Supports both same-day 
        deals and overnight deals, expiring completely once the time window shuts.
        """
        if not self.is_deal or not self.deal_date or not self.deal_start_time or not self.deal_end_time:
            return False
        
        # 🇰🇪 Get current local date and time in Nairobi
        local_now = timezone.localtime()
        current_date = local_now.date()
        current_time = local_now.time()

        start = self.deal_start_time
        end = self.deal_end_time

        # CASE 1: Standard Same-Day Deal (e.g., 08:00 to 20:00)
        if start <= end:
            if current_date != self.deal_date:
                return False
            return start <= current_time <= end

        # CASE 2: Overnight Deal spanning across midnight (e.g., 22:00 to 04:00)
        else:
            # Day 1: It's the activation day and we are past the start time
            if current_date == self.deal_date and current_time >= start:
                return True
            # Day 2: It's the morning after activation day and we are before the end time
            tomorrow_cutoff = self.deal_date + timedelta(days=1)
            if current_date == tomorrow_cutoff and current_time <= end:
                return True
            
            return False

    def __str__(self):
        status = " ACTIVE DEAL" if self.is_deal_active else "REGULAR"
        return f"[{status}] {self.name} - KES {self.price}"

# --- 4. CART MODEL ---
class CartItem(models.Model):
    user_email = models.EmailField(unique=True) 
    items = models.JSONField(default=list) 
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart: {self.user_email}"

class Order(models.Model):
    # Use UUIDField for better performance and standard compliance
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # CRITICAL: Link the order to the User object
    # This ensures it shows up in Buyer History and Admin stats correctly
    user = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name='orders',
        null=True, # Set to True initially if you have existing orders without users
        blank=True
    )
    
    # Keep user_email as a backup or for guest tracking
    user_email = models.EmailField()
    
    items = models.JSONField(default=list)
    total_price = models.FloatField(default=0.0)
    address = models.TextField(default="Karatina University")
    
    status = models.CharField(
        max_length=20, 
        choices=[
            ('Pending', 'Pending'), 
            ('Out for Delivery', 'Out for Delivery'), 
            ('Delivered', 'Delivered'),
            ('Cancelled', 'Cancelled')
        ],
        default='Pending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {str(self.id)[:8]} - {self.user_email}"