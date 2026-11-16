import { createContext, useContext } from 'react'

export interface SearchPaletteContextValue {
  openSearch: (initialQuery?: string) => void
}

export const SearchPaletteContext = createContext<SearchPaletteContextValue>({
  openSearch: () => {},
})

export function useSearchPalette(): SearchPaletteContextValue {
  return useContext(SearchPaletteContext)
}
