import { defineStore } from 'pinia'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: 'pt' // default Portuguese
  }),

  getters: {
    isEnglish: (state) => state.locale === 'en',
    isPortuguese: (state) => state.locale === 'pt'
  },

  actions: {
    setLocale(locale) {
      this.locale = locale
    },
    
    toggleLocale() {
      this.locale = this.locale === 'pt' ? 'en' : 'pt'
    },

    t(value) {
      if (typeof value === 'string') return value
      if (typeof value === 'object' && value !== null) {
        return value[this.locale] || value.pt || value.en || ''
      }
      return ''
    }
  }
})
