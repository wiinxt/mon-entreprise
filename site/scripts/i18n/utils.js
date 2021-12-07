import dotenv from 'dotenv'
import 'isomorphic-fetch'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { mergeAll, toPairs, equals, path as _path, pick } from 'ramda'
import { stringify } from 'querystring'
import '../../../modele-social/build'
import rules from '../../../modele-social'
import yaml from 'yaml'

dotenv.config()

let rulesTranslationPath = resolve('site/source/locales/rules-en.yaml')
let UiTranslationPath = resolve('site/source/locales/ui-en.yaml')
let UiOriginalTranslationPath = resolve('site/source/locales/ui-fr.yaml')

let attributesToTranslate = [
	'titre',
	'description',
	'question',
	'résumé',
	'suggestions',
	'note',
]

function getRulesMissingTranslations() {
	let currentExternalization = yaml.parse(
		readFileSync(rulesTranslationPath, 'utf-8')
	)

	let missingTranslations = []
	let resolved = Object.entries(rules)
		.map(([dottedName, rule]) => [
			dottedName,
			!rule || !rule.titre // && utils.ruleWithDedicatedDocumentationPage(rule))
				? { ...rule, titre: dottedName.split(' . ').slice(-1)[0] }
				: rule,
		])
		.map(([dottedName, rule]) => ({
			[dottedName]: mergeAll(
				toPairs(rule)
					.filter(([, v]) => !!v)
					.map(([k, v]) => {
						let attrToTranslate = attributesToTranslate.find(equals(k))
						if (!attrToTranslate) return {}
						let enTrad = attrToTranslate + '.en',
							frTrad = attrToTranslate + '.fr'

						let currentTranslation = currentExternalization[dottedName]

						if ('suggestions' === attrToTranslate) {
							return Object.keys(v).reduce((acc, suggestion) => {
								const enTrad = `suggestions.${suggestion}.en`
								const frTrad = `suggestions.${suggestion}.fr`
								if (
									currentTranslation &&
									currentTranslation[enTrad] &&
									currentTranslation[frTrad] === suggestion
								) {
									return {
										...acc,
										[frTrad]: currentTranslation[frTrad],
										[enTrad]: currentTranslation[enTrad],
									}
								}
								missingTranslations.push([dottedName, enTrad, suggestion])
								return {
									...acc,
									[frTrad]: suggestion,
								}
							}, {})
						}

						// Check if a human traduction exists already for this attribute and if
						// it does need to be updated
						if (
							currentTranslation &&
							currentTranslation[enTrad] &&
							currentTranslation[frTrad] === v
						)
							return {
								[enTrad]: currentTranslation[enTrad],
								[frTrad]: v,
							}

						missingTranslations.push([dottedName, enTrad, v])
						return {
							[frTrad]: v,
						}
					})
			),
		}))
	resolved = mergeAll(resolved)
	return [missingTranslations, resolved]
}

const getUiMissingTranslations = () => {
	const staticKeys = readFileSync(
		resolve('site/source/locales/static-analysis-fr.json')
	)
	const translatedKeys = yaml.parse(readFileSync(UiTranslationPath, 'utf-8'))
	const originalKeys = yaml.parse(
		readFileSync(UiOriginalTranslationPath, 'utf-8')
	)

	const missingTranslations = Object.entries(staticKeys)
		.filter(([key, valueInSource]) => {
			if (key.match(/^\{.*\}$/) || valueInSource === 'NO_TRANSLATION') {
				return false
			}
			const keys = key.split(/(?<=[A-zÀ-ü0-9])\.(?=[A-zÀ-ü0-9])/)

			const isNewKey = !_path(keys, translatedKeys)
			const isInvalidatedKey = _path(keys, originalKeys) !== valueInSource

			return isNewKey || isInvalidatedKey
		}, staticKeys)
		.map(([key]) => key)

	return pick(missingTranslations, staticKeys)
}

const fetchTranslation = async (text) => {
	const response = await fetch(
		`https://api.deepl.com/v2/translate?${stringify({
			text,
			auth_key: process.env.DEEPL_API_SECRET,
			tag_handling: 'xml',
			source_lang: 'FR',
			target_lang: 'EN',
		})}`
	)
	try {
		const { translations } = await response.json()
		console.log(`✅ Deepl translation succeeded for:\n\t${text}\n`)
		return translations[0].text
	} catch (e) {
		console.warn(`❌ Deepl translation failed for:\n\t${text}\n`)
		return ''
	}
}
export default {
	fetchTranslation,
	getRulesMissingTranslations,
	getUiMissingTranslations,
	rulesTranslationPath,
	UiTranslationPath,
	UiOriginalTranslationPath,
}
