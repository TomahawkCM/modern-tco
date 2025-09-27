"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LighthouseTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan-300">
                Lighthouse Performance Test Page
              </CardTitle>
              <CardDescription>
                This page is optimized for performance testing without authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  This page includes all production optimizations:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                  <li>✅ Optimized package imports (20+ packages)</li>
                  <li>✅ Advanced webpack bundle splitting</li>
                  <li>✅ Self-hosted fonts with preloading</li>
                  <li>✅ CSS optimization enabled</li>
                  <li>✅ Tree shaking for production</li>
                  <li>✅ External domain preconnects</li>
                  <li>✅ Aggressive caching headers</li>
                  <li>✅ PWA runtime caching</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Feature {i}</CardTitle>
                  <CardDescription>Optimized component</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    This is a sample card demonstrating the optimized UI components
                    with minimal JavaScript overhead.
                  </p>
                  <Button className="mt-4" variant="outline">
                    Action {i}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-300">Performance Metrics Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Performance</p>
                  <p className="text-2xl font-bold text-green-400">≥90%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Accessibility</p>
                  <p className="text-2xl font-bold text-green-400">≥85%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Best Practices</p>
                  <p className="text-2xl font-bold text-green-400">100%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">SEO</p>
                  <p className="text-2xl font-bold text-green-400">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Production Build • All Optimizations Active • Ready for Lighthouse Testing</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}