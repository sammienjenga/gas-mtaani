from rest_framework import serializers, validators
from .models import Product, CartItem, Order, User
import json


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            validators.UniqueValidator(
                queryset=User.objects.all(),
                message="A user with this email already exists."
            )
        ]
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'location', 
            'role', 'password', 'is_verified', 'otp_code'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'role': {'read_only': True},
            'otp_code': {'write_only': True, 'required': False},
            'is_verified': {'read_only': True}
        }

    def create(self, validated_data):
        email = validated_data.get('email')
        password = validated_data.pop('password', None)
        otp_code = validated_data.pop('otp_code', None)
        is_verified = validated_data.pop('is_verified', False)
        
        if password:
            user = User.objects.create_user(
                username=email,
                password=password,
                otp_code=otp_code,
                is_verified=is_verified,   
                **validated_data
            )
        else:
            user = User.objects.create(
                username=email,
                is_verified=True, 
                **validated_data
            )
            user.set_unusable_password()
            user.save()
            
        return user

class ProductSerializer(serializers.ModelSerializer):
    # This reads the @property from your model to tell the UI if the deal is currently live
    is_deal_active = serializers.ReadOnlyField()
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 
            'name', 
            'category', 
            'brand', 
            'price', 
            'weight', 
            'stock', 
            'image', 
            'description',
            'is_deal', 
            'deal_date', 
            'deal_price',        # Added for the new deal logic
            'deal_start_time',   # Added for 24h range
            'deal_end_time',     # Added for 24h range
            'is_deal_active',
            'created_at'
        ]
    def validate(self, data):
        if data.get('is_deal') is True:
            data['deal_date'] = timezone.localtime().date()
        return data
  

class CartItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'user_email', 'items', 'last_updated']

class OrderSerializer(serializers.ModelSerializer):
    # Formats created_at to "05 May 2026, 14:30" for the UI
    date = serializers.DateTimeField(
        source='created_at', 
        format="%d %b %Y, %H:%M", 
        read_only=True
    )

    class Meta:
        model = Order
        # IMPORTANT: If user_email is handled by the view, mark it read_only
        fields = ['id', 'user_email', 'items', 'total_price', 'status', 'date', 'address']
        extra_kwargs = {
            'user_email': {'read_only': True},
            'status': {'read_only': True}
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        items = representation.get('items')

        # Robust JSON parsing for the frontend
        if isinstance(items, str):
            try:
                representation['items'] = json.loads(items)
            except (ValueError, TypeError, json.JSONDecodeError):
                representation['items'] = []
        
        # Ensure total_price is a float for frontend formatting
        try:
            representation['total_price'] = float(representation.get('total_price', 0))
        except (ValueError, TypeError):
            representation['total_price'] = 0.0
            
        return representation