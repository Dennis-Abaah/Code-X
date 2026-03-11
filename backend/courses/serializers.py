from rest_framework import serializers
from .models import Language, Lesson, UserProgress


class LanguageSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Language
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'lesson_count']

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()


class LanguageWithProgressSerializer(serializers.ModelSerializer):
    """Language + per-user progress — used on the dashboard."""
    lesson_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    progress_pct = serializers.SerializerMethodField()

    class Meta:
        model = Language
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color',
                  'lesson_count', 'completed_count', 'progress_pct']

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()

    def get_completed_count(self, obj):
        user = self.context.get('request')
        if user and user.user.is_authenticated:
            return UserProgress.objects.filter(
                user=user.user, lesson__language=obj, completed=True
            ).count()
        return 0

    def get_progress_pct(self, obj):
        total = self.get_lesson_count(obj)
        if total == 0:
            return 0
        return int((self.get_completed_count(obj) / total) * 100)


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight lesson info for lists."""
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_slug = serializers.CharField(source='language.slug', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'sequence', 'image_url',
                  'is_published', 'language', 'language_name', 'language_slug']


class LessonDetailSerializer(serializers.ModelSerializer):
    """Full lesson content."""
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_slug = serializers.CharField(source='language.slug', read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'image_url', 'sequence',
                  'is_published', 'language', 'language_name', 'language_slug',
                  'is_completed', 'created_at', 'updated_at']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserProgress.objects.filter(
                user=request.user, lesson=obj, completed=True
            ).exists()
        return False


class LessonCreateSerializer(serializers.ModelSerializer):
    """For admin creating / editing lessons."""
    class Meta:
        model = Lesson
        fields = ['id', 'language', 'title', 'slug', 'content', 'image_url',
                  'sequence', 'is_published']


class UserProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'lesson', 'lesson_title', 'completed', 'completed_at']
        read_only_fields = ['user']
