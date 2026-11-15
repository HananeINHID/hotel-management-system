from django.db import migrations

from apps.reservations import triggers


def installer(apps, schema_editor):
    triggers.installer(schema_editor)


def desinstaller(apps, schema_editor):
    triggers.desinstaller(schema_editor)


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(installer, desinstaller),
    ]
