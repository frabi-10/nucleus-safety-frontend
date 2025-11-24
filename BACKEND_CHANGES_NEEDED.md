# Backend Changes Required

## Database Schema

Add the following column to the reports table:

```sql
ALTER TABLE reports ADD COLUMN form_type VARCHAR(20) DEFAULT 'SIR';
ALTER TABLE reports ADD COLUMN specific_room TEXT;
ALTER TABLE reports ADD COLUMN incident_datetime TEXT;
ALTER TABLE reports ADD COLUMN immediate_actions TEXT;
```

Update existing records:
```sql
UPDATE reports SET form_type = 'SIR' WHERE form_type IS NULL;
```

## API Changes

The existing API endpoints will work without modification. The backend just needs to accept and store the `form_type` field along with the new fields in POST requests.

### Valid form_type values:
- SIR (Safety Incident Report)
- JHA (Job Hazard Analysis)
- KAIZEN (Process Improvement)

## Email Notifications (Optional)

Update email subjects to reflect form type:
- SIR: "New Safety Incident Report"
- JHA: "New Job Hazard Analysis"
- KAIZEN: "New Process Improvement Idea"

## Deployment

1. Run database migration SQL above
2. Deploy backend code
3. Frontend will automatically start sending form_type field
