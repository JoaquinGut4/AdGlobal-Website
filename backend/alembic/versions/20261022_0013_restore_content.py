"""Restore full institutional content for seeded site_content rows.

Revision ID: 20261022_0013
Revises: 20261022_0012
"""

from alembic import op
import sqlalchemy as sa


revision = "20261022_0013"
down_revision = "20261022_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    content = sa.table("site_content", sa.column("key"), sa.column("value", sa.JSON()))
    about = {
        "heading": "Quiénes somos",
        "statement": "Alquilamos y vendemos equipos de cómputo y audiovisuales, con soporte técnico propio.",
        "description": "Somos una corporación especializada en el arrendamiento de equipos informáticos y audiovisuales, mantenimiento, soporte técnico y proyectos a medida. Contamos con un equipo calificado de ingenieros y técnicos que garantizan la máxima calidad y la continuidad operativa de tu empresa.",
        "mission": {"title": "Misión", "text": "Brindar soluciones tecnológicas de calidad, eficientes y flexibles en el arrendamiento de equipos de cómputo y audiovisuales, que garanticen la operatividad y la productividad de nuestros clientes."},
        "vision": {"title": "Visión", "text": "Ser una empresa líder en el arrendamiento de equipos tecnológicos de vanguardia y soluciones integrales competitivas, que contribuyan al crecimiento y la productividad de las empresas del Perú."},
    }
    advantages = [
        {"title": "Alquiler de equipos", "text": "Cómputo y audiovisuales por día, por mes o por proyecto, sin inversión inicial ni depreciación."},
        {"title": "Venta de equipos", "text": "Equipos nuevos de las marcas líderes, con garantía y respaldo técnico."},
        {"title": "Soporte y mantenimiento", "text": "Ingenieros y técnicos propios, con reemplazo inmediato ante cualquier falla."},
        {"title": "Licencias Microsoft", "text": "Licenciamiento Microsoft 365 y Windows para su operación completa."},
        {"title": "Proyectos a medida", "text": "Desarrollo de software, sistemas de registro y redes para su evento u operación."},
    ]
    op.execute(content.update().where(content.c.key == "about").values(value=about))
    op.execute(content.update().where(content.c.key == "advantages").values(value=advantages))


def downgrade() -> None:
    pass
