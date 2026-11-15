from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sejours', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sejour',
            name='date_arrivee_prevue',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='sejour',
            name='date_depart_prevue',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='sejour',
            name='statut_sejour',
            field=models.CharField(
                choices=[
                    ('RESERVE', 'Réservé'),
                    ('EN_COURS', 'En cours'),
                    ('TERMINE', 'Terminé'),
                    ('ANNULE', 'Annulé'),
                ],
                default='RESERVE',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='sejour',
            name='est_archive',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterModelOptions(
            name='sejour',
            options={
                'ordering': ['-date_arrivee_prevue', '-id_sejour'],
                'verbose_name': 'Séjour',
                'verbose_name_plural': 'Séjours',
            },
        ),
    ]
