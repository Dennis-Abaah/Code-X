"""
Django settings for codingapp project.
REST API backend — no templates. Frontend is a separate static app.
"""

import os
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = True

ALLOWED_HOSTS = ['*']

# ──── Installed Apps ────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third‑party
    'rest_framework',
    'corsheaders',
    # Local
    'courses',
    'accounts',
]

# ──── Middleware ────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',           # CORS — must be high
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'codingapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'codingapp.wsgi.application'

# ──── Database — PostgreSQL (Local) ────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# ──── Password Validation ────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
 
# Tells Django it's safely behind Render's HTTPS proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# These ensure cookies are only sent over HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ──── i18n ────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ──── Static Files ────
STATIC_URL = 'static/'

# ──── DRF Settings ────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.CsrfExemptSessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# ──── CORS Settings ────
# Allow the frontend (served on different port) to talk to the API
CORS_ALLOW_ALL_ORIGINS = True    # Fine for local dev
CORS_ALLOW_CREDENTIALS = True    # So session cookies are forwarded

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'https://code-x-jhmx.onrender.com',
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# ──── ImgBB API Key ────
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")

# ──── Default PK ────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
