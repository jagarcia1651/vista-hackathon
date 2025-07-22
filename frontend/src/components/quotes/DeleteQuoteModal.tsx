'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Quote {
  quote_id: string
  project_id: string | null
  quote_version_number: number
  quote_status: string
  approved_by_staffer_id: string | null
  accepted_by_client_contact_id: string | null
  created_at: string
  last_updated_at: string
}

interface DeleteQuoteModalProps {
  quote: Quote
  onClose: () => void
}

export function DeleteQuoteModal({ quote, onClose }: DeleteQuoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('quote_id', quote.quote_id)

      if (error) throw error

      onClose()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

        return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-700">Delete Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="text-slate-700">
              <p className="mb-2">Are you sure you want to delete this quote?</p>
              <div className="bg-slate-50 p-3 rounded-md text-sm space-y-1">
                <p><strong>Version:</strong> v{quote.quote_version_number}</p>
                <p><strong>Status:</strong> {quote.quote_status}</p>
                <p><strong>Created:</strong> {new Date(quote.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Deleting...' : 'Delete Quote'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 