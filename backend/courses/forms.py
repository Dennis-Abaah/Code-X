from django import forms
from .models import Language, Lesson


class LessonForm(forms.ModelForm):
    image = forms.ImageField(required=False, help_text="Upload image to host on ImgBB")

    class Meta:
        model = Lesson
        fields = ['language', 'title', 'slug', 'content', 'sequence', 'is_published']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-input'
        self.fields['content'].widget = forms.Textarea(attrs={
            'class': 'form-input content-editor',
            'rows': 15,
            'placeholder': 'Write lesson content here... HTML supported.'
        })
        self.fields['slug'].widget.attrs['placeholder'] = 'auto-generated-from-title'
