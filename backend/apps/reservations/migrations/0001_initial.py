import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('chambres', '0001_initial'),
        ('clients', '0002_alter_client_options_alter_client_email_and_more'),
        ('employes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id_reservation', models.AutoField(primary_key=True, serialize=False)),
                ('date_reservation', models.DateTimeField(auto_now_add=True)),
                ('statut_reservation', models.CharField(
                    choices=[
                        ('EN_ATTENTE', 'En attente'),
                        ('CONFIRMEE', 'Confirmée'),
                        ('ANNULEE', 'Annulée'),
                        ('TERMINEE', 'Terminée'),
                    ],
                    default='EN_ATTENTE',
                    max_length=20,
                )),
                ('nb_personnes_total', models.PositiveIntegerField(default=1)),
                ('montant_estime', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('client', models.ForeignKey(
                    db_column='id_client',
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='reservations',
                    to='clients.client',
                )),
                ('employe', models.ForeignKey(
                    db_column='id_employe',
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='reservations',
                    to='employes.employe',
                )),
            ],
            options={
                'verbose_name': 'Réservation',
                'verbose_name_plural': 'Réservations',
                'db_table': 'reservations_reservation',
            },
        ),
        migrations.CreateModel(
            name='ReservationChambre',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_arrivee_prevue', models.DateField()),
                ('date_depart_prevue', models.DateField()),
                ('nb_occupants', models.PositiveIntegerField(default=1)),
                ('tarif_nuit_applique', models.DecimalField(decimal_places=2, max_digits=10)),
                ('chambre', models.ForeignKey(
                    db_column='id_chambre',
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='reservations_chambre',
                    to='chambres.chambre',
                )),
                ('reservation', models.ForeignKey(
                    db_column='id_reservation',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='chambres_reservees',
                    to='reservations.reservation',
                )),
            ],
            options={
                'verbose_name': 'Chambre réservée',
                'verbose_name_plural': 'Chambres réservées',
                'db_table': 'reservations_reservation_chambre',
            },
        ),
        migrations.AddConstraint(
            model_name='reservationchambre',
            constraint=models.UniqueConstraint(
                fields=('reservation', 'chambre'),
                name='unique_reservation_chambre',
            ),
        ),
        migrations.AddConstraint(
            model_name='reservationchambre',
            constraint=models.CheckConstraint(
                condition=models.Q(('date_depart_prevue__gt', models.F('date_arrivee_prevue'))),
                name='date_depart_apres_arrivee_reservation',
            ),
        ),
    ]
