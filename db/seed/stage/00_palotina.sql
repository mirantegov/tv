-- Tenant "stage" — base de desenvolvimento/homologação online.
-- Reaproveita os dados de Palotina (fonte única = db/seed/palotina/*), então
-- não duplica valores: apenas inclui os mesmos seeds. Os dois diretórios são
-- montados em /seed no container do Postgres. Se um dia o stage divergir, basta
-- trocar estes \i por seeds próprios.
\i /seed/palotina/despesa.sql
\i /seed/palotina/despesa_comparativo.sql
\i /seed/palotina/receita.sql
\i /seed/palotina/receita_comparativo.sql
\i /seed/palotina/financeiro.sql
\i /seed/palotina/financeiro_analises.sql
\i /seed/palotina/tributacao.sql
\i /seed/palotina/folha.sql
\i /seed/palotina/people.sql
\i /seed/palotina/licitacoes.sql
\i /seed/palotina/contratos.sql
\i /seed/palotina/planejamento.sql
\i /seed/palotina/panorama.sql
\i /seed/palotina/tce.sql
\i /seed/palotina/siconfi.sql
\i /seed/palotina/secretarias.sql
