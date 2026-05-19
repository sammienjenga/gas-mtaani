from pathlib import Path
import os
import certifi
from django.db import models
import django_mongodb_backend.fields
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY') 
DEBUG = True
ALLOWED_HOSTS = ['localhost','127.0.0.1']

INSTALLED_APPS = [ 
    'corsheaders',
    'django_mongodb_backend',  
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    # Authentication & Social Login
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'rest_framework',
    'rest_framework.authtoken',
    'api',
]

# --- GOOGLE AUTH CONFIGURATION ---
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_ID')

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

# --- EMAIL BACKEND ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# --- DATABASE (MongoDB Atlas) ---
DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'NAME': ('Gas_Mtaani'),
        'HOST': os.getenv('DATABASE_HOST'),
        'OPTIONS': {
            'tlsCAFile': certifi.where(),
            'serverSelectionTimeoutMS': 30000, 
            'connectTimeoutMS': 30000,
            'retryWrites': True,
        }
    }
}

# --- STATIC FILES ---
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

CORS_ALLOW_ALL_ORIGINS = True

# --- CUSTOM USER MODEL ---
AUTH_USER_MODEL = 'api.User'

# --- THE MONKEY PATCH ---
models.AutoField = django_mongodb_backend.fields.ObjectIdAutoField
models.BigAutoField = django_mongodb_backend.fields.ObjectIdAutoField
models.SmallAutoField = django_mongodb_backend.fields.ObjectIdAutoField

DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


SITE_ID = 1
CORS_ALLOW_CREDENTIALS = True

TIME_ZONE = 'Africa/Nairobi'
USE_TZ = True
