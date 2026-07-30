-- Patch manual — Município de Palotina/PR (IBGE 4117909).
-- Corrige o bloco fiscal do módulo Visão Geral (PAN.tce.certidao), que é
-- alimentado por panorama.tce_resumo — tabela separada de tce.certidao
-- (usada pelo módulo TCE/PR). O patch 2026-07-30_cauc-certidao_palotina.sql
-- só atualizou tce.certidao; este cobre a certidão renovada em 29/07/2026
-- (nº 5551.ZMES.2910, consulta TCE-PR) também no card da Visão Geral.
BEGIN;
SET search_path TO panorama;

UPDATE tce_resumo
	SET cert_numero = '5551.ZMES.2910',
		cert_emissao = DATE '2026-07-29',
		cert_validade = DATE '2026-09-27'
	WHERE exercicio = 2026;

COMMIT;

-- Verificação: certidao.numero -> 5551.ZMES.2910, validade -> 27/09/2026.
SELECT (data->'tce'->'certidao') AS certidao FROM api.panorama;
