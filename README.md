# ☕ Starbucks Database
**Projeto de Análise de Banco de Dados — Ciências da Computação**  
Autora: Allana Gimenez Machado · 2025
 
---
 
## 📌 Sobre o Projeto
 
Sistema de gerenciamento de cafeteria que modela como **insumos se transformam em receitas**, calcula custos em tempo real, movimenta o estoque a cada venda e analisa a margem de lucro de cada produto.
 
O diferencial deste projeto é resolver um problema real de cafeterias: sistemas tradicionais rastreiam produtos que *entram como A e saem como A*. Aqui, múltiplos insumos (leite, xarope, café, gelo…) se combinam e saem como um único produto final — o **Iced Caramel Macchiato**.
 
---
 
## 🗂️ Estrutura de Arquivos
 
```
starbucks-db/
├── index.html      → Estrutura da página (HTML semântico)
├── style.css       → Todo o visual e layout
├── script.js       → Lógica do sistema (JavaScript)
├── database.sql    → Schema MySQL completo
└── README.md       → Este arquivo
```
 
---
 
## 🚀 Como Rodar
 
### Site (Front-end)
 
1. Baixe todos os arquivos na mesma pasta
2. Abra o `index.html` no navegador
> **Dica:** No VSCode, instale a extensão **Live Server** (botão direito no `index.html` → *Open with Live Server*) para recarregamento automático ao salvar.
 
### Banco de Dados (MySQL)
 
1. Abra o **MySQL Workbench** (ou outro cliente MySQL)
2. Abra o arquivo `database.sql`
3. Execute tudo (`Ctrl + Shift + Enter` no Workbench)
4. O script cria automaticamente o banco `cafeteria_db` com todos os dados
```sql
-- Verificar se funcionou:
USE cafeteria_db;
SHOW TABLES;
```
 
---
 
## 🗄️ Modelo de Dados
 
O banco possui **5 tabelas** com os seguintes relacionamentos:
 
```
insumos ──────────────── receitas ──────────────── produtos_finais
   1                        N:N                           1
   └──── movimentacoes_estoque         vendas ────────────┘
```
 
### Tabelas
 
| Tabela | Descrição |
|--------|-----------|
| `insumos` | Matérias-primas com custo unitário gerado automaticamente |
| `produtos_finais` | Itens do cardápio com preço de venda |
| `receitas` | Tabela pivô: liga insumos ↔ produtos com quantidade usada |
| `movimentacoes_estoque` | Histórico de toda entrada/saída de insumo |
| `vendas` | Registro de cada venda com custo e lucro calculados |
 
### Coluna Gerada (destaque técnico)
 
```sql
-- O custo unitário é calculado automaticamente pelo MySQL:
custo_unitario DECIMAL GENERATED ALWAYS AS (preco_compra / qtd_embalagem) STORED
```
 
---
 
## 📊 Views Disponíveis
 
```sql
-- Custo de produção e margem por produto
SELECT * FROM vw_custo_producao;
 
-- Insumos com estoque baixo ou crítico
SELECT * FROM vw_alerta_estoque;
 
-- Resumo de vendas por produto
SELECT * FROM vw_resumo_vendas;
```
 
---
 
## 🔍 Consultas SQL Incluídas
 
### 1. Lucratividade por Produto
Mostra custo de produção, preço de venda, lucro bruto e margem de cada bebida.
 
### 2. Custo vs Venda Proporcional por Insumo
Calcula quanto cada ingrediente custou e quanto representa proporcionalmente no preço cobrado ao cliente.
 
### 3. Estoque com Status
Lista todos os insumos com indicador visual: NORMAL / BAIXO / CRÍTICO.
 
### 4. Histórico de Movimentações
Todas as entradas e saídas de estoque com data, hora e motivo.
 
### 5. Dashboard Resumido
Totais de vendas, receita, lucro e alertas críticos em uma única linha.
 
---
 
## 💻 Funcionalidades do Sistema
 
- **Dashboard operacional** com métricas em tempo real
- **Registro de vendas** com dedução automática do estoque
- **Controle de estoque** com barras visuais e alertas
- **Feed de movimentações** com histórico completo
- **Análise de lucratividade** com custo por ingrediente
- **Diagrama ER** interativo das tabelas
- **Cadastro de novos** insumos e produtos via modal
- **Reabastecimento** de estoque com registro automático
---
 
## 🛠️ Tecnologias
 
| Camada | Tecnologia |
|--------|-----------|
| Front-end | HTML5, CSS3, JavaScript (Vanilla) |
| Banco de dados | MySQL 8.0+ |
| Fontes | Google Fonts (Cormorant Garamond + DM Sans) |
| Persistência (demo) | localStorage |
 
---
 
## 📐 Principais Conceitos de BD Utilizados
 
- `PRIMARY KEY` e `FOREIGN KEY` com `ON DELETE CASCADE`
- `GENERATED ALWAYS AS ... STORED` (coluna computada)
- `ENUM` para campos com valores fixos
- `JOIN` entre múltiplas tabelas
- `GROUP BY` com funções de agregação (`SUM`, `COUNT`)
- Subconsultas correlacionadas
- `VIEW` para consultas reutilizáveis
- `CASE WHEN` para lógica condicional no SQL
---
