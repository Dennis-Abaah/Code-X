from django.db import models
from django.conf import settings


class Language(models.Model):
    """Represents a programming language course (Python, HTML, JavaScript, C++)."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="CSS class or emoji for the language icon")
    color = models.CharField(max_length=7, default='#4F46E5', help_text="Hex color for the language card")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_lesson_count(self):
        return self.lessons.count()


class Lesson(models.Model):
    """Individual lesson within a language course."""
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    content = models.TextField(help_text="Lesson content in HTML/Markdown format")
    image_url = models.URLField(blank=True, null=True, help_text="ImgBB hosted image URL")
    sequence = models.PositiveIntegerField(default=0, help_text="Order of the lesson within the language")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sequence']
        unique_together = ['language', 'slug']

    def __str__(self):
        return f"{self.language.name} - {self.title}"


class UserProgress(models.Model):
    """Tracks which user completed which lesson."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'lesson']
        ordering = ['lesson__sequence']

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} ({'Done' if self.completed else 'In Progress'})"
