import { defineStore } from 'pinia'

interface ScreenState {
	title: string,
	theme: 'dark' | 'light'
}

export const useScreenStore = defineStore({
	id: 'screen',
	state: (): ScreenState => {
		return {
			title: '老板驾驶舱',
			theme: 'dark'
		}
	}
})
