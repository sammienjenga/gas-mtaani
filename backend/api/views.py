import random
import traceback
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token

# Google Auth Library
from google.oauth2 import id_token
from google.auth.transport import requests

from .models import Product, CartItem, Order, User
from .serializers import ProductSerializer, CartItemSerializer, OrderSerializer, UserSerializer

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get('email')
    existing_user = User.objects.filter(email=email, is_verified=False).first()
    
    if existing_user:
        return Response({
            'message': 'Account exists but unverified.', 
            'not_verified': True, 
            'email': email
        }, status=status.HTTP_200_OK)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(is_verified=False, otp_code=None)
        return Response({
            'message': 'Account created successfully.', 
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get('email')
    otp_received = str(request.data.get('otp', '')).strip()

    try:
        user = User.objects.get(email=email, otp_code=otp_received, is_verified=False)
        
        if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=3):
            user.otp_code = None 
            user.save()
            return Response({'error': 'CODE EXPIRED. REQUEST A NEW ONE.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.otp_code = None 
        user.save()
        
        return Response({'message': 'Email verified successfully. Please log in.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'INVALID OR EXPIRED CODE.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user_obj = User.objects.get(email=email)
        
        if not user_obj.is_verified and not user_obj.is_superuser:
            return Response({'error': 'Verify email first.', 'not_verified': True}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key, 
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role  
            })
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', 'User')

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': email, 'full_name': name, 'role': 'buyer', 'is_active': True, 'is_verified': True}
        )
        if created:
            user.set_unusable_password()
            user.save()

        drf_token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': drf_token.key, 'email': user.email, 'full_name': user.full_name, 'role': user.role}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Google verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

# --- DASHBOARD & STATS ---

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """
    Real-time database counts for the dashboard.
    """
    return Response({
        "inventory": Product.objects.count(),
        "customers": User.objects.filter(role='buyer', is_verified=True).count(),
        "orders": Order.objects.exclude(status='Cancelled').count()
    })

# --- SECURITY & OTP (RE-ADDED VERIFY_OTP_RESET) ---

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        if user.otp_created_at and timezone.now() < user.otp_created_at + timedelta(seconds=60):
            return Response({"error": "PLEASE WAIT 60 SECONDS."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_created_at = timezone.now()
        user.save()

        try:
            html_content = render_to_string('emails/welcome_email.html', {'user_name': user.full_name, 'otp': otp})
            email_msg = EmailMultiAlternatives('Gas Mtaani - Code', strip_tags(html_content), settings.EMAIL_HOST_USER, [email])
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()
            return Response({"message": "Code sent!"})
        except Exception:
            traceback.print_exc() 
            return Response({'error': 'Internal server error during email dispatch.'}, status=500)
    except User.DoesNotExist:
        return Response({"error": "No account found."}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_reset(request):
    """
    Verifies OTP specifically for password resets. 5-minute window.
    """
    email = request.data.get('email')
    otp_received = request.data.get('otp')
    new_password = request.data.get('new_password')

    try:
        user = User.objects.get(
            email=email, 
            otp_code=otp_received,
            otp_created_at__gte=timezone.now() - timedelta(minutes=5)
        )
        user.set_password(new_password)
        user.otp_code = None  
        user.save()
        return Response({"message": "Password updated successfully!"})
    except User.DoesNotExist:
        return Response({"error": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list(request):
    """
    Public GET for everyone.
    Admin-only POST for creating new products.
    """
    if request.method == 'GET':
        products = Product.objects.all().order_by('-created_at')
        return Response(ProductSerializer(products, many=True).data)
    
    if request.method == 'POST':
        # Strict Admin Check
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "ADMIN PRIVILEGES REQUIRED"}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser]) 
def product_detail_admin(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"detail": "PRODUCT NOT FOUND"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductSerializer(product).data)
    
    if request.method == 'PATCH':
        # NEW: Handle the 24H Deal Range Logic
        # This matches the fields we added to the Serializer/Model
        if 'is_deal' in request.data:
            # We use a partial update to handle deal_price, start, and end times
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Return the updated product including the calculated is_deal_active
                return Response(ProductSerializer(product).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Standard Product Update Logic (for name, price, stock, etc.)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        product.delete()
        return Response({"message": "REMOVED FROM INVENTORY"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cart_operations(request):
    cart, _ = CartItem.objects.get_or_create(user_email=request.user.email)
    if request.method == 'GET':
        return Response(CartItemSerializer(cart).data)
    if request.method == 'POST':
        cart.items = request.data.get('items', [])
        cart.save()
        return Response({'message': 'Cart Synced'})

# --- PROFILE & ORDERS ---

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_detail(request):
    user = request.user
    if request.method == 'PATCH':
        user.phone = request.data.get('phone', user.phone)
        user.full_name = request.data.get('full_name', user.full_name)
        user.save()
    return Response({"full_name": user.full_name, "email": user.email, "phone": user.phone, "role": user.role})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_operations(request):
    if request.method == 'GET':
        # FIX: If user is admin/staff, show ALL orders. Otherwise, show only theirs.
        if request.user.is_staff or request.user.role == 'admin':
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user_email=request.user.email).order_by('-created_at')
            
        return Response(OrderSerializer(orders, many=True).data)

    if request.method == 'POST':
        serializer = OrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True) 

        try:
            # Save the user's name and email into the order for the Admin to see
            serializer.save(
                user_email=request.user.email, 
                user_name=request.user.full_name, # Added this to match your Admin UI
                status='Pending'
            )
            
            # Clear Cart after successful order
            CartItem.objects.filter(user_email=request.user.email).delete()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Database write failed: {str(e)}"}, status=500)

# FIX: Add or Update this specific view to handle the Admin PATCH requests
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser]) # Only admins can touch this
def update_order_status(request, pk):
    try:
        # Support both standard ID and MongoDB _id if using Djongo
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    if request.method == 'GET':
        return Response(OrderSerializer(order).data)

    if request.method == 'PATCH':
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            return Response(OrderSerializer(order).data)
        return Response({'error': 'No status provided'}, status=400)

    if request.method == 'DELETE':
        order.delete()
        return Response(status=204)