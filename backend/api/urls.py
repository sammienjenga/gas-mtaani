from django.urls import path
from . import views

urlpatterns = [
    # --- 1. AUTHENTICATION & GOOGLE LOGIN ---
    path('signup/', views.signup, name='signup'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('login/', views.login, name='login'),
    path('google-login/', views.google_login, name='google-login'),

    # --- 2. SECURITY & OTP (FORGOT PASSWORD / RESET) ---
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp-reset/', views.verify_otp_reset, name='verify-otp-reset'),

    # --- 3. DASHBOARD STATS (NEW) ---
    # This provides the automatic counting for Inventory, Customers, and Orders
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),

    # --- 4. PRODUCTS ---
    path('products/', views.product_list, name='product-list'),
    
    # Using product_detail_admin here allows for GET, PATCH (Deals/Hours), and DELETE
    path('products/<str:pk>/', views.product_detail_admin, name='product-detail-admin'),

    # --- 5. CART & ORDERS ---
    path('cart/', views.cart_operations, name='cart-operations'),
    path('orders/', views.order_operations, name='order-operations'),
    path('orders/<str:pk>/status/', views.update_order_status, name='update-order-status'),

    # --- 6. PROFILE ---
    path('profile/', views.profile_detail, name='profile-detail'),
]