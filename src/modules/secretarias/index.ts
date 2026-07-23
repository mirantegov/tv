import type { ComponentType } from "react";
import Administracao from "./Administracao";
import Agronegocio from "./Agronegocio";
import AssistenciaSocial from "./AssistenciaSocial";
import Controladoria from "./Controladoria";
import DesenvolvimentoEconomico from "./DesenvolvimentoEconomico";
import Educacao from "./Educacao";
import Esportes from "./Esportes";
import Financas from "./Financas";
import Gabinete from "./Gabinete";
import Industria from "./Industria";
import MeioAmbiente from "./MeioAmbiente";
import Obras from "./Obras";
import Planejamento from "./Planejamento";
import Saude from "./Saude";
import Seguranca from "./Seguranca";
import Transito from "./Transito";
import Urbanismo from "./Urbanismo";

// slug (path /sec/<slug>) → módulo da secretaria. App.tsx resolve o `el` daqui.
export const SECRETARIA_MODULES: Record<string, ComponentType> = {
	administracao: Administracao,
	financas: Financas,
	planejamento: Planejamento,
	obras: Obras,
	agronegocio: Agronegocio,
	saude: Saude,
	"assistencia-social": AssistenciaSocial,
	educacao: Educacao,
	industria: Industria,
	esportes: Esportes,
	gabinete: Gabinete,
	controladoria: Controladoria,
	urbanismo: Urbanismo,
	"desenvolvimento-economico": DesenvolvimentoEconomico,
	transito: Transito,
	seguranca: Seguranca,
	"meio-ambiente": MeioAmbiente,
};
