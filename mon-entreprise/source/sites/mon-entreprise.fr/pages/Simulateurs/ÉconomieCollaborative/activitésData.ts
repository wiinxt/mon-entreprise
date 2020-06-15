import { map, pipe, unnest } from 'ramda'
import activitésEn from './activités.en.yaml'
import activités from './activités.yaml'

export type Activity = {
	titre: string
	explication: string
	icônes: string
	plateformes: Array<string>
	'seuil pro': number
	'seuil déclaration': number
	'seuil régime général': number
	activités: Array<Activity>
	'exonérée sauf si': Array<{ titre: string; explication: string }>
}

export { activités }
export const flatActivités: Array<Activity> = pipe(
	map((a: Activity) => (a.activités ? [a, ...a.activités] : [a])),
	unnest
)(activités)

export const getActivité = (a: string) =>
	flatActivités.find(item => item.titre === a) as Activity

export const getTranslatedActivité = (title: string, language: string) =>
	({
		...getActivité(title),
		...(language !== 'fr' && activitésEn[title])
	} as Activity)

export const getMinimumDéclaration = (a: string) => {
	const activité = getActivité(a)
	if (activité['seuil pro'] === 0 && !activité['seuil régime général']) {
		return 'RÉGIME_GÉNÉRAL_NON_DISPONIBLE'
	}
	if (activité['seuil pro'] === 0) {
		return 'RÉGIME_GÉNÉRAL_DISPONIBLE'
	}
	if (activité['seuil déclaration'] === 0) {
		return 'IMPOSITION'
	}
	if (activité['seuil déclaration']) {
		return 'AUCUN'
	}
	return null
}
export const hasConditions = (a: string) => {
	const activité = getActivité(a)
	return !!(
		activité['exonérée sauf si'] ||
		(activité['seuil pro'] && activité['seuil pro'] !== 0) ||
		activité['seuil déclaration'] ||
		activité['seuil pro'] ||
		activité.activités
	)
}

export const getSousActivités = (a: string) =>
	(getActivité(a).activités || []).map(({ titre }: { titre: string }) => titre)
