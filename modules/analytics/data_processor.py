import json
import pandas as pd
import os
import sys
from datetime import datetime

# Ajuste de PATH para garantir que o Python encontre a pasta 'database'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.repository import OrionRepository

class DataProcessor:
    def __init__(self, raw_data_path='data/reports/apify_results.json'):
        self.raw_path = raw_data_path
        # Inicializa o repositório do Banco de Dados
        self.repo = OrionRepository()
        
    def load_data(self):
        """Carrega o JSON bruto gerado pelo Apify."""
        if not os.path.exists(self.raw_path):
            print(f"❌ Arquivo não encontrado: {self.raw_path}")
            return []
        
        with open(self.raw_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def process_posts(self, raw_data):
        """
        Transforma dados brutos em DataFrame enriquecido com métricas.
        """
        if not raw_data:
            return None

        cleaned_posts = []
        
        for item in raw_data:
            # Filtro de segurança: ignora itens que não são posts
            if not item.get('shortCode'): 
                continue

            # 1. Extração de Dados Básicos
            likes = item.get('likesCount', 0)
            comments = item.get('commentsCount', 0)
            
            # Tenta pegar seguidores do dono do post
            owner = item.get('owner', {})
            followers = owner.get('followersCount', 0)
            
            # 2. Cálculo de Métricas (Engenharia de Dados)
            engagement_rate = 0.0
            if followers > 0:
                engagement_rate = ((likes + comments) / followers) * 100
            
            # Tipagem de conteúdo
            post_type = item.get('type', 'Image')
            if item.get('videoUrl'):
                post_type = 'Reels/Video'
            
            post_data = {
                "Data": item.get('timestamp', '')[:10],
                "Username": item.get('ownerUsername', 'Desconhecido'),
                "Tipo": post_type,
                "Likes": likes,
                "Comentários": comments,
                "Interações Totais": likes + comments,
                "Engajamento (%)": round(engagement_rate, 2),
                "Legenda": item.get('caption', '')[:100].replace('\n', ' '),
                "Link": item.get('url'),
                "ID": item.get('shortCode')
            }
            
            cleaned_posts.append(post_data)

        # Transforma em Tabela (Pandas DataFrame)
        df = pd.DataFrame(cleaned_posts)
        
        # Ordena por Engajamento (Melhores primeiro)
        if not df.empty:
            df = df.sort_values(by='Engajamento (%)', ascending=False)
            
        return df

    def generate_terminal_report(self, df):
        """Gera um relatório visual no terminal para validarmos."""
        if df is None or df.empty:
            print("⚠️ Nenhum post processado para o relatório.")
            return

        print("\n📊 --- RELATÓRIO DE INTELIGÊNCIA (ORION v2) ---")
        print(f"Posts Analisados: {len(df)}")
        print(f"Engajamento Médio: {df['Engajamento (%)'].mean():.2f}%")
        print("-" * 80)
        
        # Mostra as colunas principais
        display_cols = ['Data', 'Tipo', 'Likes', 'Comentários', 'Engajamento (%)']
        print(df[display_cols].to_string(index=False))
        print("-" * 80)
        
        # Identifica o "Campeão"
        best_post = df.iloc[0]
        print(f"🏆 MELHOR POST: {best_post['Link']}")
        print(f"   Motivo: {best_post['Engajamento (%)']}% de engajamento ({best_post['Likes']} likes)")

    def run_pipeline(self):
        """Método mestre que orquestra a extração, análise e persistência."""
        # 1. Carrega os dados brutos
        raw_data = self.load_data()
        if not raw_data:
            return

        # 2. Processamento e Relatório Visual
        df = self.process_posts(raw_data)
        self.generate_terminal_report(df)

        # 3. Persistência de Dados (Memória Histórica)
        print("\n" + "=" * 80)
        self.repo.save_scraping_results(raw_data)
        print("=" * 80 + "\n")

if __name__ == "__main__":
    processor = DataProcessor()
    processor.run_pipeline()