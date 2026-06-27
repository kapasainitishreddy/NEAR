import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
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
import Insights from './screens/Insights.jsx'
import Quiz from './screens/Quiz.jsx'
import Poll from './screens/Poll.jsx'
import LockScreen from './components/LockScreen.jsx'

function Splash() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-b from-gold-300 to-gold-500 text-3xl shadow-glow"
        >
          🧾
        </motion.div>
        <p className="font-serif text-xl tracking-tightish text-ivory-50">Receipts</p>
        <p className="mt-1 text-sm text-white/40">Loading your private space…</p>
      </motion.div>
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
  const { loading, settings, locked } = useApp()
  const location = useLocation()

  if (loading || !settings) return <Splash />

  // App lock gate — before anything else once it's been set up.
  if (locked) {
    return (
      <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
        <LockScreen />
      </MotionConfig>
    )
  }

  // Public routes anyone can open (e.g. a shared poll link) — no onboarding.
  const isPublic = location.pathname.startsWith('/poll')

  // Gate the app behind onboarding until completed.
  if (!settings.onboarded && location.pathname !== '/onboarding' && !isPublic) {
    return <Navigate to="/onboarding" replace />
  }

  const hideNav = location.pathname === '/onboarding' || isPublic

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
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
            <Route path="/insights" element={<Page><Insights /></Page>} />
            <Route path="/quiz" element={<Page><Quiz /></Page>} />
            <Route path="/poll/:id" element={<Page><Poll /></Page>} />
            <Route path="/view/:type/:id" element={<Page><DetailView /></Page>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AnimatePresence>
        {!hideNav && <BottomNav />}
      </div>
    </MotionConfig>
  )
}
