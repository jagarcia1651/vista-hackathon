-- Create project_profitability_snapshots table
CREATE TABLE IF NOT EXISTS project_profitability_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  project_id UUID NOT NULL,
  baseline_id UUID NULL,
  total_profitability DOUBLE PRECISION NOT NULL,
  triggered_by_agent VARCHAR(50) NULL,
  triggered_by_action VARCHAR(100) NULL,

  CONSTRAINT project_profitability_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT project_profitability_snapshots_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects (project_id),
  CONSTRAINT project_profitability_snapshots_baseline_id_fkey
    FOREIGN KEY (baseline_id) REFERENCES project_profitability_snapshots (id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profitability_project_id
  ON project_profitability_snapshots (project_id);
CREATE INDEX IF NOT EXISTS idx_profitability_baseline_id
  ON project_profitability_snapshots (baseline_id);
CREATE INDEX IF NOT EXISTS idx_profitability_created_at
  ON project_profitability_snapshots (created_at);

-- Create the profitability calculation function
CREATE OR REPLACE FUNCTION calculate_project_profitability(project_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM((staffer_billable - staffer_cost)::numeric), 0)
    FROM (
      SELECT
        staffer_rates.staffer_id,
        (staffer_rates.bill_rate * SUM(COALESCE(project_tasks.estimated_hours, 0))) AS staffer_billable,
        (staffer_rates.cost_rate * SUM(COALESCE(project_tasks.estimated_hours, 0))) AS staffer_cost
      FROM staffer_rates
      LEFT JOIN staffer_assignments
        ON staffer_assignments.staffer_id = staffer_rates.staffer_id
      LEFT JOIN project_tasks
        ON project_tasks.project_task_id = staffer_assignments.project_task_id
      WHERE project_tasks.project_id = project_uuid
      GROUP BY staffer_rates.staffer_id, staffer_rates.bill_rate, staffer_rates.cost_rate
    ) AS sub
  );
END;
$$ LANGUAGE plpgsql;