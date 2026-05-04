from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a secure admin/superuser for LifeAid'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email')
        parser.add_argument('--username', type=str, help='Admin username')
        parser.add_argument('--password', type=str, help='Admin password')

    def handle(self, *args, **options):
        email = options.get('email') or input('Email: ')
        username = options.get('username') or input('Username: ')
        password = options.get('password') or input('Password: ')

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'User with email {email} already exists.'))
            return

        user = User.objects.create_superuser(
            email=email,
            username=username,
            password=password,
            role=User.Roles.ADMIN,
            is_verified=True
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin: {email}'))
