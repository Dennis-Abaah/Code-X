from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('languages/', views.language_list, name='language_list'),

    # Authenticated — Student
    path('dashboard/', views.dashboard, name='dashboard'),
    path('languages/<slug:slug>/lessons/', views.language_lessons, name='language_lessons'),
    path('languages/<slug:lang_slug>/lessons/<slug:lesson_slug>/',
         views.lesson_detail, name='lesson_detail'),
    path('lessons/<int:lesson_id>/complete/', views.mark_complete, name='mark_complete'),
    path('lessons/<int:lesson_id>/incomplete/', views.mark_incomplete, name='mark_incomplete'),

    # Admin — Content Management
    path('admin/lessons/', views.admin_lessons_list, name='admin_lessons_list'),
    path('admin/lessons/create/', views.admin_create_lesson, name='admin_create_lesson'),
    path('admin/lessons/<int:lesson_id>/edit/', views.admin_edit_lesson, name='admin_edit_lesson'),
    path('admin/lessons/<int:lesson_id>/delete/', views.admin_delete_lesson, name='admin_delete_lesson'),
]
