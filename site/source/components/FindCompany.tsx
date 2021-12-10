import { useSearchFieldState } from '@react-stately/searchfield'
import { useSetEntreprise } from 'Actions/companyStatusActions'
import { FabriqueSocialEntreprise } from 'API/fabrique-social'
import CompanyDetails from 'Components/CompanyDetails'
import { SearchField } from 'DesignSystem/field'
import { Spacing } from 'DesignSystem/layout'
import { Body } from 'DesignSystem/typography/paragraphs'
import useSearchCompany from 'Hooks/useSearchCompany'
import { Trans, useTranslation } from 'react-i18next'

export default function Search() {
	const { t } = useTranslation()
	const setEntreprise = useSetEntreprise()
	const searchFieldProps = {
		label: t('CompanySearchField.label', "Nom de l'entreprise, SIREN ou SIRET"),
		placeholder: t(
			'CompanySearchField.placeholder',
			'Café de la gare ou 40123778000127'
		),
	}
	const state = useSearchFieldState(searchFieldProps)
	const [searchPending, results] = useSearchCompany(state.value)

	return (
		<>
			<Body>
				<Trans i18nKey="trouver.description">
					Grâce à la base SIREN, les données publiques sur votre entreprise
					seront automatiquement disponibles pour la suite du parcours sur le
					site.
				</Trans>
			</Body>

			<SearchField
				data-testid="popover-company-search-input"
				state={state}
				isSearchStalled={searchPending}
				{...searchFieldProps}
			/>

			<Spacing sm />

			{!searchPending && state.value && results.length === 0 && (
				<Body>
					<Trans>Aucun résultat</Trans>
				</Body>
			)}

			{results &&
				results.map((entreprise: FabriqueSocialEntreprise) => (
					<button
						onClick={() => setEntreprise(entreprise)}
						key={entreprise.siren}
						css={`
							text-align: left;
							width: 100%;
							padding: 0 0.4rem;
							border-radius: 0.3rem;
						`}
					>
						<CompanyDetails entreprise={entreprise} />
					</button>
				))}
		</>
	)
}
