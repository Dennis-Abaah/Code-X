from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-input'
            field.widget.attrs['autocomplete'] = 'off'


class ProfileForm(forms.Form):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    bio = forms.CharField(widget=forms.Textarea(attrs={'rows': 4}), required=False)
    theme = forms.ChoiceField(choices=[('light', 'Light'), ('dark', 'Dark')])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-input'
