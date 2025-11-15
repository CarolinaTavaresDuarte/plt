import pandas as pd


df = pd.read_excel("autismo_estudantes_cor.xlsx", header=5)
print(df.columns.tolist())