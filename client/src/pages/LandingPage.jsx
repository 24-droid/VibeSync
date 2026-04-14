import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0f1428] to-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            VibeSync
          </h1>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight">
              Find Your{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Perfect Vibe
              </span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Upload an image, detect your mood, and discover personalized music recommendations powered by AI. Build collections and explore what resonates with you.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-border text-foreground font-semibold px-8 py-4 rounded-lg hover:bg-border/80 transition-all text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 border border-border">
            <div className="text-6xl mb-4">🎨🎵</div>
            <p className="text-muted text-sm">
              Experience the intersection of visual art and music discovery
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">
            How VibeSync Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📸',
                title: 'Upload Image',
                description: 'Share any photo and let our AI analyze the mood',
              },
              {
                icon: '🎭',
                title: 'Mood Detection',
                description: 'Advanced AI detects emotions and creates a mood profile',
              },
              {
                icon: '🎨',
                title: 'Color Analysis',
                description: 'Extract dominant colors to enhance recommendations',
              },
              {
                icon: '🎵',
                title: 'Get Recommendations',
                description: 'Receive personalized song suggestions based on your mood',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-6 border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-12 border border-primary/50">
            <h2 className="text-3xl font-bold font-display mb-4">
              Ready to discover your vibe?
            </h2>
            <p className="text-muted mb-6">
              Join thousands of music lovers using VibeSync to find their perfect soundtrack
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Start Free Today
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted text-sm">
          <p>© 2024 VibeSync. All rights reserved. Find your vibe, discover your music.</p>
        </div>
      </footer>
    </div>
  )
}
