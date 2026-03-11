from django.contrib.auth import login, logout, authenticate
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    """GET /api/auth/csrf/ — return a CSRF token for the frontend."""
    token = get_token(request)
    return Response({'csrfToken': token})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """POST /api/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    login(request, user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/auth/login/"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid username or password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response({
        'status': 'ok',
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/"""
    logout(request)
    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/ — current logged-in user."""
    return Response(UserSerializer(request.user).data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """PUT /api/auth/profile/"""
    serializer = ProfileUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    user.save()

    if 'bio' in data:
        profile.bio = data['bio']
    if 'theme' in data:
        profile.theme = data['theme']
    profile.save()

    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_theme(request):
    """POST /api/auth/theme/ — quick theme toggle."""
    theme = request.data.get('theme', 'light')
    if theme not in ('light', 'dark'):
        return Response({'error': 'Invalid theme.'}, status=status.HTTP_400_BAD_REQUEST)

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.theme = theme
    profile.save()
    return Response({'status': 'ok', 'theme': theme})
