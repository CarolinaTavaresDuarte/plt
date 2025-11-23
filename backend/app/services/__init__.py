# Arquivo que mostra para a aplicação quais funções e módulos são acessíveis para os routers 
from .core import (
    classify_orientation,
    compute_test_score,
)
from .ibge_importer import import_ibge_autism_file
from .ibge_analytics import get_indigenous_autism_summary
from .ibge_resident_autism_sex import get_resident_gender_autism_distribution
