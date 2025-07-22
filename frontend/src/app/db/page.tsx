import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TableData {
  tableName: string
  displayName: string
  data: any[]
  error?: string
}

export default async function DatabasePage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view database data</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Query all core tables
  const tables: TableData[] = []
  
  // Core PSA tables to display
  const coreQueries = [
    { table: 'clients', display: 'Clients' },
    { table: 'client_contacts', display: 'Client Contacts' },
    { table: 'projects', display: 'Projects' },
    { table: 'project_phases', display: 'Project Phases' },
    { table: 'project_tasks', display: 'Project Tasks' },
    { table: 'staffers', display: 'Staffers' },
    { table: 'skills', display: 'Skills' },
    { table: 'seniorities', display: 'Seniorities' },
    { table: 'staffer_skills', display: 'Staffer Skills' },
    { table: 'staffer_rates', display: 'Staffer Rates' },
    { table: 'quotes', display: 'Quotes' },
    { table: 'agents', display: 'Agents' },
    { table: 'addresses', display: 'Addresses' }
  ]

  // Execute queries for each table
  for (const query of coreQueries) {
    try {
      const { data, error } = await supabase
        .from(query.table)
        .select('*')
        .limit(10) // Limit to first 10 rows
      
      tables.push({
        tableName: query.table,
        displayName: query.display,
        data: data || [],
        error: error?.message
      })
    } catch (err) {
      tables.push({
        tableName: query.table,
        displayName: query.display,
        data: [],
        error: `Failed to query: ${err}`
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Database Viewer</h1>
              <p className="text-lg text-slate-600 mt-2">
                Core PSA tables and data verification
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Database Connection Status
            </CardTitle>
            <CardDescription>
              Connected to Supabase • User: {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-slate-700">Tables Queried</div>
                <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Successful Queries</div>
                <div className="text-2xl font-bold text-green-600">
                  {tables.filter(t => !t.error).length}
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Failed Queries</div>
                <div className="text-2xl font-bold text-red-600">
                  {tables.filter(t => t.error).length}
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Total Records</div>
                <div className="text-2xl font-bold text-purple-600">
                  {tables.reduce((sum, t) => sum + (t.data?.length || 0), 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tables.map((table) => (
            <TableCard key={table.tableName} table={table} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TableCard({ table }: { table: TableData }) {
  const hasData = table.data && table.data.length > 0
  const hasError = !!table.error

  return (
    <Card className={`${hasError ? 'border-red-200' : hasData ? 'border-green-200' : 'border-yellow-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{table.displayName}</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              hasError ? 'bg-red-500' : hasData ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-normal text-slate-600">
              {hasError ? 'Error' : hasData ? `${table.data.length} records` : 'Empty'}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          Table: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{table.tableName}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasError ? (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            <strong>Error:</strong> {table.error}
          </div>
        ) : !hasData ? (
          <div className="text-yellow-600 text-sm bg-yellow-50 p-3 rounded">
            No data found in this table
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show first few records */}
            {table.data.slice(0, 3).map((record, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded text-xs">
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(record).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-slate-600">{key}:</span>
                      <span className="text-slate-800 truncate ml-2 max-w-32">
                        {value?.toString() || 'null'}
                      </span>
                    </div>
                  ))}
                  {Object.keys(record).length > 4 && (
                    <div className="text-slate-500 text-center mt-1">
                      ... {Object.keys(record).length - 4} more fields
                    </div>
                  )}
                </div>
              </div>
            ))}
            {table.data.length > 3 && (
              <div className="text-center text-slate-500 text-sm">
                ... {table.data.length - 3} more records
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 