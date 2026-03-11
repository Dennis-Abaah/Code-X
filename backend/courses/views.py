import base64
import requests as http_requests
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from .models import Language, Lesson, UserProgress
from .serializers import (
    LanguageSerializer, LanguageWithProgressSerializer,
    LessonListSerializer, LessonDetailSerializer, LessonCreateSerializer,
)


# ──────────────────────────────────────
# Public
# ──────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def language_list(request):
    """GET /api/languages/ — list all languages (public)."""
    languages = Language.objects.all()
    serializer = LanguageSerializer(languages, many=True)
    return Response(serializer.data)


# ──────────────────────────────────────
# Authenticated — Student
# ──────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """GET /api/dashboard/ — languages with per-user progress."""
    languages = Language.objects.all()
    serializer = LanguageWithProgressSerializer(
        languages, many=True, context={'request': request}
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def language_lessons(request, slug):
    """GET /api/languages/<slug>/lessons/ — lessons for a language with completion flags."""
    language = get_object_or_404(Language, slug=slug)
    lessons = language.lessons.filter(is_published=True)

    completed_ids = set(
        UserProgress.objects.filter(
            user=request.user, lesson__language=language, completed=True
        ).values_list('lesson_id', flat=True)
    )

    total = lessons.count()
    completed_count = len(completed_ids)
    progress_pct = int((completed_count / total) * 100) if total > 0 else 0

    lesson_data = LessonListSerializer(lessons, many=True).data
    for item in lesson_data:
        item['is_completed'] = item['id'] in completed_ids

    return Response({
        'language': LanguageSerializer(language).data,
        'lessons': lesson_data,
        'total': total,
        'completed_count': completed_count,
        'progress_pct': progress_pct,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lesson_detail(request, lang_slug, lesson_slug):
    """GET /api/languages/<lang_slug>/lessons/<lesson_slug>/ — single lesson."""
    language = get_object_or_404(Language, slug=lang_slug)
    lesson = get_object_or_404(Lesson, language=language, slug=lesson_slug, is_published=True)
    serializer = LessonDetailSerializer(lesson, context={'request': request})

    # prev / next
    lessons_qs = list(language.lessons.filter(is_published=True))
    current_idx = None
    for i, l in enumerate(lessons_qs):
        if l.id == lesson.id:
            current_idx = i
            break

    prev_lesson = None
    next_lesson = None
    if current_idx is not None and current_idx > 0:
        prev_lesson = LessonListSerializer(lessons_qs[current_idx - 1]).data
    if current_idx is not None and current_idx < len(lessons_qs) - 1:
        next_lesson = LessonListSerializer(lessons_qs[current_idx + 1]).data

    return Response({
        'lesson': serializer.data,
        'prev_lesson': prev_lesson,
        'next_lesson': next_lesson,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_complete(request, lesson_id):
    """POST /api/lessons/<id>/complete/"""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    progress, _ = UserProgress.objects.get_or_create(user=request.user, lesson=lesson)
    progress.completed = True
    progress.completed_at = timezone.now()
    progress.save()
    return Response({'status': 'ok', 'completed': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_incomplete(request, lesson_id):
    """POST /api/lessons/<id>/incomplete/"""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    progress = UserProgress.objects.filter(user=request.user, lesson=lesson).first()
    if progress:
        progress.completed = False
        progress.completed_at = None
        progress.save()
    return Response({'status': 'ok', 'completed': False})


# ──────────────────────────────────────
# Admin — Content Management
# ──────────────────────────────────────

def _upload_to_imgbb(image_file):
    """Upload an image file to ImgBB, return the URL or None."""
    api_key = settings.IMGBB_API_KEY
    image_data = base64.b64encode(image_file.read()).decode('utf-8')
    resp = http_requests.post(
        'https://api.imgbb.com/1/upload',
        data={'key': api_key, 'image': image_data},
    )
    if resp.status_code == 200:
        return resp.json()['data']['url']
    return None


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_lessons_list(request):
    """GET /api/admin/lessons/ — all lessons (including drafts)."""
    lessons = Lesson.objects.select_related('language').all().order_by('language__name', 'sequence')
    serializer = LessonListSerializer(lessons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_lesson(request):
    """POST /api/admin/lessons/create/ — create a lesson. Accepts multipart with optional image."""
    serializer = LessonCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    lesson = serializer.save()

    # Handle image upload
    image_file = request.FILES.get('image')
    if image_file:
        url = _upload_to_imgbb(image_file)
        if url:
            lesson.image_url = url
            lesson.save()

    return Response(LessonDetailSerializer(lesson, context={'request': request}).data,
                    status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_edit_lesson(request, lesson_id):
    """PUT/PATCH /api/admin/lessons/<id>/edit/"""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    serializer = LessonCreateSerializer(lesson, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    lesson = serializer.save()

    image_file = request.FILES.get('image')
    if image_file:
        url = _upload_to_imgbb(image_file)
        if url:
            lesson.image_url = url
            lesson.save()

    return Response(LessonDetailSerializer(lesson, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_lesson(request, lesson_id):
    """DELETE /api/admin/lessons/<id>/delete/"""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    title = lesson.title
    lesson.delete()
    return Response({'status': 'ok', 'message': f'Lesson "{title}" deleted.'})
