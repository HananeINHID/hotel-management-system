"""
Migration Phase D : Finalisation des contraintes non-nullables et unicité.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chambres', '0001_initial'),
        ('reservations', '0001_initial'),
        ('sejours', '0004_reconcile_sejours_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sejour',
            name='chambre',
            field=models.ForeignKey(
                db_column='id_chambre',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='sejours',
                to='chambres.chambre',
            ),
        ),
        migrations.AlterField(
            model_name='sejour',
            name='reservation',
            field=models.ForeignKey(
                db_column='id_reservation',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='sejours',
                to='reservations.reservation',
            ),
        ),
        migrations.AddConstraint(
            model_name='sejour',
            constraint=models.UniqueConstraint(
                fields=('reservation', 'chambre'),
                name='unique_sejour_reservation_chambre',
            ),
        ),
    ]
