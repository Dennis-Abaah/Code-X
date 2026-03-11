from django.core.management.base import BaseCommand
from courses.models import Language


class Command(BaseCommand):
    help = 'Seed the database with the 4 programming languages'

    def handle(self, *args, **options):
        languages = [
            {
                'name': 'Python',
                'slug': 'python',
                'description': 'A versatile, beginner-friendly language used in web development, data science, AI, and automation.',
                'icon': '🐍',
                'color': '#3776AB',
            },
            {
                'name': 'HTML',
                'slug': 'html',
                'description': 'The standard markup language for creating and structuring web pages and web applications.',
                'icon': '🌐',
                'color': '#E34F26',
            },
            {
                'name': 'JavaScript',
                'slug': 'javascript',
                'description': 'The language of the web — used for interactive frontends, server-side development, and more.',
                'icon': '⚡',
                'color': '#F7DF1E',
            },
            {
                'name': 'C++',
                'slug': 'cpp',
                'description': 'A powerful systems programming language used in game engines, embedded systems, and high-performance applications.',
                'icon': '⚙️',
                'color': '#00599C',
            },
        ]

        for lang_data in languages:
            lang, created = Language.objects.get_or_create(
                slug=lang_data['slug'],
                defaults=lang_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created language: {lang.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Language already exists: {lang.name}'))

        self.stdout.write(self.style.SUCCESS('Done seeding languages!'))
