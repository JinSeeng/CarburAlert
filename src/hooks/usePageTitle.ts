import { useEffect } from 'react'

export function usePageTitle(titre: string) {
  useEffect(() => {
    document.title = titre
  }, [titre])
}
