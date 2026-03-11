from django.db import models
from django.conf import settings


class UserProfile(models.Model):
    """Extended user profile for theme preference and settings."""
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def get_overall_progress(self):
        """Returns a dict with language progress percentages."""
        from courses.models import Language, Lesson, UserProgress
        progress_data = {}
        for lang in Language.objects.all():
            total_lessons = lang.lessons.filter(is_published=True).count()
            if total_lessons == 0:
                progress_data[lang.slug] = 0
                continue
            completed = UserProgress.objects.filter(
                user=self.user,
                lesson__language=lang,
                completed=True
            ).count()
            progress_data[lang.slug] = int((completed / total_lessons) * 100)
        return progress_data
