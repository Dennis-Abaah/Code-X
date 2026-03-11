from django.contrib import admin
from .models import Language, Lesson, UserProgress


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'get_lesson_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'sequence', 'is_published', 'created_at']
    list_filter = ['language', 'is_published']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['language', 'sequence']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'completed', 'completed_at']
    list_filter = ['completed', 'lesson__language']
