import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import Toast from './components/Toast.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import ScriptGenerator from './screens/ScriptGenerator.jsx'
import ReceiptCreator from './screens/ReceiptCreator.jsx'
import Library from './screens/Library.jsx'
import Rules from './screens/Rules.jsx'
import Settings from './screens/Settings.jsx'
import DetailView from './screens/DetailView.jsx'

function Splash() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-b from-gold-300 to-gold-500" />
        <p className="font-serif text-lg text-white/70">Receipts</p>
      </div>
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

function Page({ children }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md px-5 pb-32 pt-1"
    >
      {children}
    </motion.main>
  )
}

export default function App() {
  const { loading, settings } = useApp()
  const location = useLocation()

  if (loading || !settings) return <Splash />

  // Gate the app behind onboarding until completed.
  if (!settings.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  const hideNav = location.pathname === '/onboarding'

  return (
    <div className="relative min-h-full">
      <Toast />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<Page><Onboarding /></Page>} />
          <Route path="/home" element={<Page><Home /></Page>} />
          <Route path="/script" element={<Page><ScriptGenerator /></Page>} />
          <Route path="/script/:id" element={<Page><ScriptGenerator /></Page>} />
          <Route path="/receipt" element={<Page><ReceiptCreator /></Page>} />
          <Route path="/receipt/:id" element={<Page><ReceiptCreator /></Page>} />
          <Route path="/library" element={<Page><Library /></Page>} />
          <Route path="/rules" element={<Page><Rules /></Page>} />
          <Route path="/settings" element={<Page><Settings /></Page>} />
          <Route path="/view/:type/:id" element={<Page><DetailView /></Page>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
      {!hideNav && <BottomNav />}
    </div>
  )
}
