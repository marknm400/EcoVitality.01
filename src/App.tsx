import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Defs } from './components/Scene'
import Journey from './components/Journey'
import Global from './components/Global'
import { Nav, Rail, Footer } from './components/Chrome'
import Home from './pages/Home'
import Produto from './pages/Produto'
import Contato from './pages/Contato'
import NotFound from './pages/NotFound'

const get = () => location.hash.replace(/^#/, '') || '/'
const PAGES: Record<string, () => JSX.Element> = { '/': Home, '/jornada': Journey as () => JSX.Element, '/produto': Produto, '/contato': Contato }

export default function App() {
  const [route, setRoute] = useState(get)
  // Roteamento por hash, com transição entre telas quando o navegador suporta
  useEffect(() => {
    const on = () => {
      const go = () => { flushSync(() => setRoute(get())); scrollTo(0, 0) }
      const d = document as any
      d.startViewTransition ? d.startViewTransition(go) : go()
    }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const Page = PAGES[route] || NotFound
  return (
    <>
      <a className="skip" href={'#' + route} onClick={e => { e.preventDefault(); document.getElementById('main')?.focus() }}>Pular para o conteúdo</a>
      <Defs /><Global route={route} /><Rail /><Nav route={route} />
      <main id="main" tabIndex={-1} key={route}><Page /></main>
      <Footer />
    </>
  )
}
