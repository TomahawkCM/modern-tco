import { AuthGuard } from '@/components/auth/AuthGuard'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              TCO Study Platform
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Tanium Certified Operator Exam Preparation
            </p>
          </div>
          
          <SignInForm />
          
          <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Prepare for the TAN-1000 certification exam with interactive learning modules,
              hands-on labs, and comprehensive practice assessments.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}