'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, TrendingUp, CheckCircle2, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DocumentStats {
  totalDocuments: number
  analyzedDocuments: number
  averageConfidence: number
  accuracyRate: number
  documentsByType: Array<{ type: string; count: number; accuracy: number }>
  confidenceDistribution: Array<{ range: string; count: number }>
  expirationDateAccuracy: number
  trendByDate: Array<{ date: string; total: number; accurate: number }>
}

export function AIInsightsDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/company/ai-training/document-analysis')
        if (!response.ok) throw new Error('Failed to fetch stats')
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="text-white text-center py-8">Cargando datos...</div>
  if (error) return <div className="text-red-400 text-center py-8">{error}</div>
  if (!stats) return <div className="text-slate-400 text-center py-8">Sin datos disponibles</div>

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDocuments}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.analyzedDocuments} analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{Math.round(stats.averageConfidence * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Model confidence</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{Math.round(stats.accuracyRate * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Feedback-based accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Expiration Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{Math.round(stats.expirationDateAccuracy * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Date accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="by-type" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="by-type" className="text-slate-300">Por Tipo</TabsTrigger>
          <TabsTrigger value="confidence" className="text-slate-300">Confianza</TabsTrigger>
          <TabsTrigger value="trend" className="text-slate-300">Tendencia</TabsTrigger>
        </TabsList>

        <TabsContent value="by-type" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Documents by Type & Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.documentsByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="type" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Documents" />
                  <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Confidence Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.confidenceDistribution}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.confidenceDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 p-3 bg-slate-700/50 rounded">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-amber-400">Focus Areas</p>
                    <p className="text-xs mt-1">Documents with low confidence (&lt;70%) need better training data</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-slate-700/50 rounded">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-green-400">Strong Performance</p>
                    <p className="text-xs mt-1">High accuracy on document type detection and expiration dates</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-slate-700/50 rounded">
                  <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-blue-400">Improvement</p>
                    <p className="text-xs mt-1">Use feedback loop to continuously train the model better</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Accuracy Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.trendByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Documents" strokeWidth={2} />
                  <Line type="monotone" dataKey="accurate" stroke="#10b981" name="Accurate" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recommendations for Better Model</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Collect more examples of low-confidence document types for training</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Use the feedback table to identify patterns in misclassifications</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Focus on expiration date extraction improvements (currently {Math.round(stats.expirationDateAccuracy * 100)}%)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Create specialized models for document categories with &lt;80% accuracy</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Export feedback data weekly to train a custom model with your specific documents</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
