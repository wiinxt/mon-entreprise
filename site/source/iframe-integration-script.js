import { iframeResizer } from 'iframe-resizer'
import logoFrSvg from 'Images/logo-monentreprise.svg'
import logoEnSvg from 'Images/logo-mycompany.svg'
import { hexToHSL } from './hexToHSL'

let script =
		document.getElementById('script-monentreprise') ||
		document.getElementById('script-simulateur-embauche'),
	moduleName = script.dataset.module || 'simulateur-embauche',
	couleur =
		script.dataset.couleur &&
		encodeURIComponent(
			JSON.stringify(hexToHSL(script.dataset.couleur.toUpperCase()))
		),
	lang = script.dataset.lang || 'fr',
	fr = lang === 'fr',
	baseUrl =
		script.dataset.iframeUrl ||
		(fr ? process.env.FR_BASE_URL : process.env.EN_BASE_URL) +
			'/iframes/' +
			moduleName,
	integratorUrl = encodeURIComponent(window.location.href.toString()),
	src =
		baseUrl +
		(baseUrl.indexOf('?') !== -1 ? '&' : '?') +
		`couleur=${couleur}&iframe&integratorUrl=${integratorUrl}&lang=${lang}`

const iframe = document.createElement('iframe')
const iframeAttributes = {
	id: 'simulateurEmbauche',
	src,
	style: 'border: none; width: 100%; display: block; height: 700px',
	allow: 'clipboard-write',
	allowfullscreen: true,
	webkitallowfullscreen: true,
	mozallowfullscreen: true,
}
for (var key in iframeAttributes) {
	iframe.setAttribute(key, iframeAttributes[key])
}
iframeResizer(
	{
		interval: 0,
		heightCalculationMethod: 'lowestElement',
	},
	iframe
)

const links = document.createElement('div')
const moduleToSitePath = {
	'simulateur-embauche': '/simulateurs/salarié',
	'simulateur-autoentrepreneur': '/simulateurs/auto-entrepreneur',
	'simulateur-independant': '/simulateurs/indépendant',
	'simulateur-dirigeantsasu': '/simulateurs/dirigeant-sasu',
}
const simulateurLink =
	process.env.FR_BASE_URL + moduleToSitePath[moduleName] ?? ''

const url = new URL(simulateurLink, window.location.origin)
const params = new URLSearchParams(url.search)
params.append('utm_source', 'iframe')
params.append('utm_medium', 'iframe')
params.append('utm_campaign', 'newtext')
url.search = params.toString()
const simulateurURL = url.toString()
url.pathname = '/simulateurs'
const simulateursURL = url.toString()
url.pathname = '/'
const monEntrepriseUrl = url.toString()
links.innerHTML = `
	<div style="text-align: center; margin-bottom: 2rem; font-size: 80%">
	Ce simulateur a été créé par
	<a href="${simulateurURL}">
		mon-entreprise.urssaf.fr
	</a><br/>
	Découvrez l'ensemble des simulateurs disponibles <a href="${simulateursURL}">ici</a><br/>

	<a href="${monEntrepriseUrl}">
			<img
				style="height: 40px; margin: 10px"
				src="${process.env.FR_BASE_URL + '/' + (lang === 'fr' ? logoFrSvg : logoEnSvg)}"
				alt="mon-entreprise.urssaf.fr : l'assistant officiel du créateur d'entreprise"
			/>
		</a>

	</div>
`

script.parentNode.insertBefore(iframe, script)
script.parentNode.insertBefore(links, script)
