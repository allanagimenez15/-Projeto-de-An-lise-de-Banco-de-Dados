-- ============================================================
--  STARBUCKS DATABASE — Schema Completo
--  Projeto: Análise de Banco de Dados
--  Autora : Allana Gimenez Machado
--  SGBD   : MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS cafeteria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cafeteria_db;

-- ============================================================
-- 1. INSUMOS
--    Matérias-primas com custo unitário gerado automaticamente
-- ============================================================
CREATE TABLE IF NOT EXISTS insumos (
  id             INT           NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(100)  NOT NULL,
  unidade_medida ENUM('ml','g','un') NOT NULL DEFAULT 'ml',
  qtd_embalagem  DECIMAL(10,2) NOT NULL,
  preco_compra   DECIMAL(10,2) NOT NULL,
  custo_unitario DECIMAL(10,6) GENERATED ALWAYS AS
                   (preco_compra / qtd_embalagem) STORED,
  estoque_atual  DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- ============================================================
-- 2. PRODUTOS FINAIS
--    Itens do cardápio com preço de venda
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos_finais (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  tamanho     VARCHAR(20)   NOT NULL DEFAULT 'Grande',
  preco_venda DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
);

-- ============================================================
-- 3. RECEITAS  (tabela pivô)
--    Liga cada insumo a um produto com a quantidade usada
-- ============================================================
CREATE TABLE IF NOT EXISTS receitas (
  id               INT           NOT NULL AUTO_INCREMENT,
  produto_id       INT           NOT NULL,
  insumo_id        INT           NOT NULL,
  quantidade_usada DECIMAL(10,3) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (produto_id) REFERENCES produtos_finais(id) ON DELETE CASCADE,
  FOREIGN KEY (insumo_id)  REFERENCES insumos(id)         ON DELETE CASCADE
);

-- ============================================================
-- 4. MOVIMENTAÇÕES DE ESTOQUE
--    Registro automático de toda entrada/saída de insumo
-- ============================================================
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id         INT           NOT NULL AUTO_INCREMENT,
  insumo_id  INT           NOT NULL,
  tipo       ENUM('entrada','saida') NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  motivo     VARCHAR(200)  NOT NULL DEFAULT '',
  data_hora  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. VENDAS
--    Registro de cada venda com custo e lucro calculados
-- ============================================================
CREATE TABLE IF NOT EXISTS vendas (
  id              INT           NOT NULL AUTO_INCREMENT,
  produto_id      INT           NOT NULL,
  quantidade      INT           NOT NULL DEFAULT 1,
  preco_cobrado   DECIMAL(10,2) NOT NULL,
  custo_calculado DECIMAL(10,4) NOT NULL,
  lucro_bruto     DECIMAL(10,4) GENERATED ALWAYS AS
                    (preco_cobrado - custo_calculado) STORED,
  data_hora       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (produto_id) REFERENCES produtos_finais(id) ON DELETE CASCADE
);


-- ============================================================
-- DADOS INICIAIS — INSUMOS
-- ============================================================
INSERT INTO insumos (nome, unidade_medida, qtd_embalagem, preco_compra, estoque_atual, estoque_minimo) VALUES
  ('Leite Integral',        'ml',  1000,  5.50,  10000, 1000),
  ('Xarope de Baunilha',    'ml',   700, 65.00,   2100,  350),
  ('Café Espresso (Grãos)', 'un',     1,  0.80,    200,   30),
  ('Calda de Caramelo',     'g',   1000, 45.00,   3000,  200),
  ('Gelo (Saco)',           'g',   5000, 13.00,  15000, 2000),
  ('Copo + Tampa Bolha',    'un',     1,  1.10,    150,   20),
  ('Canudo',                'un',     1,  0.10,    300,   50),
  ('Leite de Aveia',        'ml',  1000, 12.00,   5000,  500),
  ('Xarope de Caramelo',    'ml',   700, 55.00,   1400,  200),
  ('Creme Chantilly',       'ml',   500, 18.00,   2000,  250);

-- ============================================================
-- DADOS INICIAIS — PRODUTOS FINAIS
-- ============================================================
INSERT INTO produtos_finais (nome, tamanho, preco_venda) VALUES
  ('Iced Caramel Macchiato', 'Grande', 22.00),
  ('Cappuccino',             'Médio',  18.50),
  ('Oat Latte',              'Grande', 24.00);

-- ============================================================
-- DADOS INICIAIS — RECEITAS
-- ============================================================
-- Iced Caramel Macchiato (id=1)
INSERT INTO receitas (produto_id, insumo_id, quantidade_usada) VALUES
  (1, 1,  240),   -- 240ml Leite Integral
  (1, 2,   22.2), -- 22.2ml Xarope de Baunilha
  (1, 3,    2),   -- 2 doses Café Espresso
  (1, 4,   20),   -- 20g Calda de Caramelo
  (1, 5,  250),   -- 250g Gelo
  (1, 6,    1),   -- 1 Copo + Tampa
  (1, 7,    1);   -- 1 Canudo

-- Cappuccino (id=2)
INSERT INTO receitas (produto_id, insumo_id, quantidade_usada) VALUES
  (2, 1,  180),   -- 180ml Leite Integral
  (2, 3,    2),   -- 2 doses Café Espresso
  (2, 10,  60),   -- 60ml Creme Chantilly
  (2, 6,    1),   -- 1 Copo + Tampa
  (2, 7,    1);   -- 1 Canudo

-- Oat Latte (id=3)
INSERT INTO receitas (produto_id, insumo_id, quantidade_usada) VALUES
  (3, 8,  240),   -- 240ml Leite de Aveia
  (3, 3,    2),   -- 2 doses Café Espresso
  (3, 9,   15),   -- 15ml Xarope de Caramelo
  (3, 6,    1),   -- 1 Copo + Tampa
  (3, 7,    1);   -- 1 Canudo


-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View: custo de produção por produto
CREATE OR REPLACE VIEW vw_custo_producao AS
SELECT
    p.id,
    p.nome        AS produto,
    p.tamanho,
    p.preco_venda,
    ROUND(SUM(r.quantidade_usada * i.custo_unitario), 4) AS custo_producao,
    ROUND(p.preco_venda - SUM(r.quantidade_usada * i.custo_unitario), 4) AS lucro_unitario,
    ROUND(
        (p.preco_venda - SUM(r.quantidade_usada * i.custo_unitario))
        / p.preco_venda * 100, 2
    ) AS margem_pct
FROM produtos_finais p
JOIN receitas r ON r.produto_id = p.id
JOIN insumos  i ON i.id = r.insumo_id
GROUP BY p.id, p.nome, p.tamanho, p.preco_venda;

-- View: alerta de estoque baixo
CREATE OR REPLACE VIEW vw_alerta_estoque AS
SELECT
    id,
    nome,
    unidade_medida,
    estoque_atual,
    estoque_minimo,
    CASE
        WHEN estoque_atual <= estoque_minimo              THEN 'CRÍTICO'
        WHEN estoque_atual <= estoque_minimo * 2          THEN 'BAIXO'
        ELSE 'NORMAL'
    END AS status_estoque
FROM insumos
WHERE estoque_atual <= estoque_minimo * 2
ORDER BY estoque_atual / estoque_minimo ASC;

-- View: resumo de vendas por produto
CREATE OR REPLACE VIEW vw_resumo_vendas AS
SELECT
    p.nome        AS produto,
    p.tamanho,
    COUNT(v.id)   AS total_pedidos,
    SUM(v.quantidade) AS unidades_vendidas,
    ROUND(SUM(v.preco_cobrado * v.quantidade), 2)   AS receita_total,
    ROUND(SUM(v.custo_calculado * v.quantidade), 2) AS custo_total,
    ROUND(SUM(v.lucro_bruto * v.quantidade), 2)     AS lucro_total
FROM vendas v
JOIN produtos_finais p ON p.id = v.produto_id
GROUP BY p.id, p.nome, p.tamanho
ORDER BY lucro_total DESC;


-- ============================================================
-- CONSULTAS PRONTAS
-- ============================================================

-- 1. Lucratividade completa por produto
SELECT
    p.nome       AS Produto,
    p.tamanho    AS Tamanho,
    ROUND(SUM(r.quantidade_usada * i.custo_unitario), 2) AS Custo_Producao,
    p.preco_venda                                         AS Preco_Venda,
    ROUND(p.preco_venda - SUM(r.quantidade_usada * i.custo_unitario), 2) AS Lucro_Bruto,
    CONCAT(
        ROUND(
            (p.preco_venda - SUM(r.quantidade_usada * i.custo_unitario))
            / p.preco_venda * 100, 1
        ), '%'
    ) AS Margem
FROM produtos_finais p
JOIN receitas r ON r.produto_id = p.id
JOIN insumos  i ON i.id = r.insumo_id
GROUP BY p.id, p.nome, p.tamanho, p.preco_venda
ORDER BY Lucro_Bruto DESC;

-- 2. Custo real vs venda proporcional por insumo (sua consulta original)
SELECT
    p.nome                 AS Bebida,
    p.tamanho              AS Tamanho,
    i.nome                 AS Insumo,
    r.quantidade_usada     AS Qtd_Usada,
    i.unidade_medida       AS Unidade,
    ROUND(r.quantidade_usada * i.custo_unitario, 2) AS Valor_Custo_Insumo,
    ROUND(
        ( (r.quantidade_usada * i.custo_unitario) /
          (SELECT SUM(r2.quantidade_usada * i2.custo_unitario)
           FROM receitas r2
           JOIN insumos i2 ON r2.insumo_id = i2.id
           WHERE r2.produto_id = p.id)
        ) * p.preco_venda, 2
    ) AS Valor_Venda_Proporcional_Insumo
FROM receitas r
JOIN produtos_finais p ON r.produto_id = p.id
JOIN insumos i         ON r.insumo_id  = i.id
ORDER BY p.nome, Valor_Venda_Proporcional_Insumo DESC;

-- 3. Estoque atual com status
SELECT
    nome,
    unidade_medida  AS Unidade,
    estoque_atual   AS Estoque,
    estoque_minimo  AS Minimo,
    ROUND(custo_unitario, 4) AS Custo_Unit,
    CASE
        WHEN estoque_atual <= estoque_minimo      THEN '🔴 CRÍTICO'
        WHEN estoque_atual <= estoque_minimo * 2  THEN '🟡 BAIXO'
        ELSE '🟢 NORMAL'
    END AS Status
FROM insumos
ORDER BY estoque_atual / estoque_minimo ASC;

-- 4. Histórico de movimentações
SELECT
    me.data_hora,
    i.nome         AS Insumo,
    me.tipo        AS Tipo,
    me.quantidade  AS Quantidade,
    i.unidade_medida AS Unidade,
    me.motivo
FROM movimentacoes_estoque me
JOIN insumos i ON i.id = me.insumo_id
ORDER BY me.data_hora DESC;

-- 5. Dashboard resumido
SELECT
    (SELECT COUNT(*)            FROM vendas)                   AS Total_Vendas,
    (SELECT ROUND(SUM(preco_cobrado * quantidade),2) FROM vendas) AS Receita_Total,
    (SELECT ROUND(SUM(lucro_bruto * quantidade),2)   FROM vendas) AS Lucro_Total,
    (SELECT COUNT(*) FROM insumos WHERE estoque_atual <= estoque_minimo) AS Alertas_Criticos;
