import { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import api from '../api/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts'
import {
  Activity, Users, Clock, Sparkles, TrendingUp, Zap,
  RefreshCw, Download, Database, Layers, CheckCircle2, Music, Filter
} from 'lucide-react'
import { toast } from 'sonner'

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

export default function AnalyticsDashboardPage() {
  const [timeframe, setTimeframe] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [data, setData] = useState(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/analytics/dashboard?timeframe=${timeframe}`)
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      const res = await api.post('/analytics/seed')
      toast.success(res.data.message || 'Seeded analytics demo data!')
      await fetchDashboardData()
    } catch (err) {
      toast.error('Failed to seed analytics demo data')
    } finally {
      setSeeding(false)
    }
  }

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/analytics/export?format=csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `vibesync_analytics_${timeframe}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Analytics CSV report downloaded!')
    } catch (err) {
      toast.error('Failed to export CSV report')
    }
  }

  const kpis = data?.kpis || {
    totalVisitors: 0,
    totalSessions: 0,
    totalEvents: 0,
    avgSessionDurationSeconds: 0,
    moodConversionRate: 0,
    recommendationCTR: 0
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-[#070711] text-white selection:bg-indigo-500 selection:text-white pb-16">
      <NavigationBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Header Title & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  VibeSync <span className="shimmer-text">Web Analytics Engine</span>
                </h1>
                <p className="text-sm text-white/50">
                  Real-time user behavior, mood telemetry, session tracking & recommendation funnel analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Database indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              {data?.isDbConnected ? 'MongoDB Engine' : 'In-Memory Engine'}
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center bg-white/[0.05] border border-white/[0.08] p-1 rounded-xl text-xs font-medium">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === t.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-white/50 hover:text-white'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Seed Button */}
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all text-white shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Seeding...' : '⚡ Seed Presentation Data'}
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            {/* Refresh */}
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/70 hover:text-white transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              title: 'Total Visitors',
              value: kpis.totalVisitors,
              sub: 'Unique sessions & users',
              icon: Users,
              color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400'
            },
            {
              title: 'Active Sessions',
              value: kpis.totalSessions,
              sub: 'Tracked user sessions',
              icon: Activity,
              color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400'
            },
            {
              title: 'Total Events',
              value: kpis.totalEvents,
              sub: 'Page views & clicks',
              icon: Layers,
              color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
            },
            {
              title: 'Avg Session Time',
              value: formatDuration(kpis.avgSessionDurationSeconds),
              sub: 'Engagement duration',
              icon: Clock,
              color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
            },
            {
              title: 'Rec. Click Rate',
              value: `${kpis.recommendationCTR}%`,
              sub: 'AI Recommendation CTR',
              icon: TrendingUp,
              color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400'
            },
            {
              title: 'Mood Conversion',
              value: `${kpis.moodConversionRate}%`,
              sub: 'Prompt -> Song Play',
              icon: Sparkles,
              color: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-400'
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-br border ${card.color} backdrop-blur-lg flex flex-col justify-between transition-transform hover:-translate-y-1 duration-200`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">{card.title}</span>
                <card.icon className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black tracking-tight text-white">{card.value}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs for Dashboard Sections */}
        <div className="flex border-b border-white/[0.08] overflow-x-auto scrollbar-none gap-2 pb-1">
          {[
            { id: 'overview', label: 'Overview & Time-Series', icon: TrendingUp },
            { id: 'mood', label: 'Mood Telemetry & Affinities', icon: Sparkles },
            { id: 'recommendation', label: 'AI Recommendation KPIs', icon: Music },
            { id: 'funnel', label: 'Conversion Funnel Analysis', icon: Filter },
            { id: 'live', label: 'Real-Time Activity Feed', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${active
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab 1: Overview & Time-Series */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time-Series Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Events & Traffic Over Time</h3>
                  <p className="text-xs text-white/40">Daily page views, vibe analyses, and song play interactions</p>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.timeSeriesData || []}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVibe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f0f23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#6366f1" fillOpacity={1} fill="url(#colorPv)" />
                    <Area type="monotone" dataKey="vibeAnalyses" name="Vibe Analyses" stroke="#ec4899" fillOpacity={1} fill="url(#colorVibe)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Live Feed Widget */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Recent Activity Stream
                  </h3>
                  <span className="text-xs text-white/40">Latest 5</span>
                </div>

                <div className="mt-4 space-y-3">
                  {(data?.recentEvents || []).slice(0, 5).map((evt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs space-y-1">
                      <div className="flex items-center justify-between text-white/70">
                        <span className="font-semibold text-indigo-300">{evt.eventType}</span>
                        <span className="text-[10px] text-white/40">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-white/50 truncate">{evt.userEmail} &bull; {evt.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('live')}
                className="w-full mt-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/70 hover:text-white transition-all text-center"
              >
                View Full Live Telemetry Feed &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Mood Analytics */}
        {activeTab === 'mood' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution Donut Chart */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Mood Distribution Telemetry</h3>
                <p className="text-xs text-white/40">Breakdown of AI detected moods across user search sessions</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                {data?.moodDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.moodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f0f23', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-white/40 text-sm">No mood data recorded yet. Click "Seed Demo Data" above!</div>
                )}
              </div>
            </div>

            {/* Mood Conversion Rates */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Mood Engagement & Conversion</h3>
                <p className="text-xs text-white/40">Percentage of mood analyses leading to recommended song plays</p>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.moodConversionData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="mood" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f0f23', borderRadius: '12px' }} />
                    <Bar dataKey="conversionRate" name="Conversion Rate (%)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Recommendation Engine KPIs */}
        {activeTab === 'recommendation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Top Engaged Recommended Tracks</h3>
                <p className="text-xs text-white/40">Most played and saved AI recommended songs</p>
              </div>

              <div className="space-y-3 pt-2">
                {(data?.topTracks || []).map((track, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{track.title}</div>
                        <div className="text-xs text-white/50">{track.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {track.plays} Plays
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {track.saves} Saves
                      </span>
                    </div>
                  </div>
                ))}
                {(!data?.topTracks || data.topTracks.length === 0) && (
                  <div className="text-white/40 text-sm py-8 text-center">No track interaction metrics recorded yet.</div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white">Recommendation Metrics Summary</h3>
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-xs text-indigo-300 font-medium">Vibe Analyses Triggered</div>
                  <div className="text-2xl font-black text-white mt-1">{data?.kpis?.vibeAnalysisCount || 0}</div>
                </div>

                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <div className="text-xs text-pink-300 font-medium">Song Previews Played</div>
                  <div className="text-2xl font-black text-white mt-1">{data?.kpis?.songPlayCount || 0}</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs text-emerald-300 font-medium">Tracks Saved to Collections</div>
                  <div className="text-2xl font-black text-white mt-1">{data?.kpis?.songSaveCount || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Conversion Funnel Analysis */}
        {activeTab === 'funnel' && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Multi-Stage User Funnel Analysis</h3>
              <p className="text-xs text-white/40">Visual step-by-step conversion pipeline from initial page visit to song save</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
              {(data?.funnelData || []).map((step, idx) => (
                <div key={idx} className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-indigo-400 mb-1">{step.stage}</div>
                    <div className="text-2xl font-black text-white">{step.count}</div>
                    <div className="text-xs text-white/50 mt-1">{step.percentage}% conversion</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-white/40">
                    Drop-off: <span className="text-rose-400 font-medium">{step.dropoff} users</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.funnelData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis type="category" dataKey="stage" stroke="rgba(255,255,255,0.6)" fontSize={11} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f0f23', borderRadius: '12px' }} />
                  <Bar dataKey="count" name="Users / Events" fill="#ec4899" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 5: Real-Time Live Activity Feed */}
        {activeTab === 'live' && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Real-Time User Telemetry Stream
                </h3>
                <p className="text-xs text-white/40">Live stream of captured user events, page views & mood interactions</p>
              </div>

              <button
                onClick={fetchDashboardData}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Poll Telemetry
              </button>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-white/40 font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">User Identity</th>
                    <th className="py-3 px-4">Path</th>
                    <th className="py-3 px-4">Mood</th>
                    <th className="py-3 px-4">Metadata / Prompt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(data?.recentEvents || []).map((evt, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white/50 font-mono">
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-300">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                          {evt.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/80">{evt.userEmail}</td>
                      <td className="py-3 px-4 text-white/60 font-mono">{evt.path}</td>
                      <td className="py-3 px-4 text-pink-400 font-medium">{evt.mood || '-'}</td>
                      <td className="py-3 px-4 text-white/50 max-w-xs truncate">{evt.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
