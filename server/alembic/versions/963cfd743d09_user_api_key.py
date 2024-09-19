"""user_api_key

Revision ID: 963cfd743d09
Revises: 22c3a116d540
Create Date: 2024-09-19 16:53:01.065570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '963cfd743d09'
down_revision: Union[str, None] = '22c3a116d540'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_api_key',
    sa.Column('uakid', sa.String(), nullable=False),
    sa.Column('key', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('agent', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('use_count', sa.Numeric(), nullable=True),
    sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
    sa.Column('expires_at', sa.TIMESTAMP(), nullable=True),
    sa.ForeignKeyConstraint(['agent'], ['agents.agid'], ),
    sa.PrimaryKeyConstraint('uakid'),
    sa.UniqueConstraint('key')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_api_key')
    # ### end Alembic commands ###
