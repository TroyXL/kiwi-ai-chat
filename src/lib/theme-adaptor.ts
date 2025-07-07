export function themeAdaptor() {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  function updateDarkMode(e: MediaQueryListEvent | MediaQueryList) {
    if (e.matches) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }
  updateDarkMode(darkModeMediaQuery)
  darkModeMediaQuery.addEventListener('change', updateDarkMode)
}
