import uuid
from django.db import models
from django.utils import timezone
from datetime import time
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
    
    # Using DecimalField for better price accuracy
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)      
    stock = models.IntegerField(default=0)      
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # NEW: 24-Hour Deal Fields
    is_deal = models.BooleanField(default=False)
    deal_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deal_start_time = models.TimeField(null=True, blank=True) # Format: HH:MM:SS
    deal_end_time = models.TimeField(null=True, blank=True)   # Format: HH:MM:SS

    @property
    def is_deal_active(self):
        """
        Calculates if the deal is currently live based on the system clock.
        Supports deals that stay within one day and overnight deals.
        """
        if not self.is_deal or not self.deal_start_time or not self.deal_end_time:
            return False
        
        # Get current time in your local timezone (Karatina/Nairobi)
        current_time = timezone.localtime().time()
        
        start = self.deal_start_time
        end = self.deal_end_time

        if start <= end:
            # Normal range (e.g., 08:00 to 20:00)
            return start <= current_time <= end
        else:
            # Overnight range (e.g., 22:00 to 04:00)
            return current_time >= start or current_time <= end

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