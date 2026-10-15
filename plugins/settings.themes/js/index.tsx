/// <reference types="@revenge-mod/themes-api/hidden" />
/// <reference types="@revenge-mod/types/plugins/settings.plugins" />

import { ToastActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { RootNavigationRef } from '@revenge-mod/discord/modules/main_tabs_v2'
import { onSettingsModulesLoaded } from '@revenge-mod/discord/modules/settings'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'
import { RouteNames, Setting } from './constants'
import { isThemePlugin } from './utils/plugins'
import type { PluginApi, PreInitPluginApi } from '@revenge-mod/plugins/types'

export let themesInternal: PreInitPluginApi['themesInternal']
export let pluginSettings: PluginApi['pluginSettings']

interface Settings {
	guideShownAt?: number
}

export default plugin<{ jsonStorage: Settings }>({
	jsonStorage: {
		load: true,
	},
	preInit({ themesInternal: internal }) {
		themesInternal = internal
	},
	start({ cleanup, pluginSettings: settings, jsonStorage, plugin }) {
		pluginSettings = settings
		// Manage theme plugins under Themes instead of standard plugins settings
		settings.claimPlugins(isThemePlugin)
		cleanup(
			onSettingsModulesLoaded(() => {
				import('./register').then(({ default: register }) =>
					cleanup(register()),
				)
			}),
		)

		if (plugin.startedLate) {
			jsonStorage.get().then(settings => {
				if (settings.guideShownAt == null) {
					const navigation = RootNavigationRef.getRootNavigationRef()
					navigation.navigate('settings', {
						screen: RouteNames[Setting.RevengeThemes],
					})

					ToastActionCreators.open('REVENGE_THEMES_GUIDE', {
						icon: lookupGeneratedIconComponent(
							'CircleInformationIcon',
							'CircleInformationIcon-primary',
							'CircleInformationIcon-secondary',
						),
						text: (
							<Design.Text variant="text-md/normal" color="text-strong">
								You can access this page from{' '}
								<Design.Text variant="text-md/bold">
									Settings &gt; Themes
								</Design.Text>{' '}
								next time.
							</Design.Text>
						),
						duration: 10000,
					})

					jsonStorage.set({ guideShownAt: Date.now() })
				}
			})
		}
	},
})
