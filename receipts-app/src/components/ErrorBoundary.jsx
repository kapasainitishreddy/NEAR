import { Component } from 'react'

// Production safety net: if any screen throws while rendering, we show a calm
// recovery card instead of a blank white screen. Because all data lives in
// local storage, reloading almost always restores the user's work intact.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // No telemetry — this app never phones home. Log locally for debugging.
    if (import.meta.env.DEV) console.error('Receipts crashed:', error, info)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-full items-center justify-center px-6">
        <div className="card w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] text-3xl">
            🌧️
          </div>
          <h1 className="font-serif text-xl text-ivory-50">Something slipped</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/50">
            An unexpected error interrupted the app. Your saved scripts, receipts, and rules are
            stored on this device and should still be safe.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-gold-300 to-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 shadow-glow active:scale-[0.98]"
          >
            Reload Receipts
          </button>
        </div>
      </div>
    )
  }
}
