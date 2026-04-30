# Database Migrations

This directory contains all database schema migrations for the DIT CyberClub application.

## Running Migrations

### Manual Execution
1. Open your database client (phpMyAdmin, MySQL Workbench, or command line)
2. Select the `dit_cyberclub` database
3. Open and execute each SQL migration file in chronological order (by filename)

### Command Line
```bash
cd /opt/lampp/htdocs/ditweb
mysql -u root dit_cyberclub < migrations/20260430_000001_add_conditional_logic_to_form_fields.sql
```

## Migration Files

### 20260430_000001_add_conditional_logic_to_form_fields.sql
**Purpose**: Enable conditional branching for event form fields  
**Changes**:
- Adds `conditional_parent_field_id` column to track parent question relationships
- Adds `conditional_parent_value` column to store which option triggers the child question
- Creates foreign key constraint for referential integrity
- Creates index for performance optimization

**Affected Tables**: `event_form_fields`

**Rollback**: Uncommented SQL at bottom of file can be executed to undo this migration

## Migration Status

| Migration | Date | Status | Description |
|-----------|------|--------|-------------|
| 20260430_000001 | 2026-04-30 | ✓ Ready | Add conditional logic to form fields |

## Best Practices

1. **Before running migrations**: 
   - Backup your database
   - Review the migration SQL
   - Test on a development environment first

2. **Naming convention**: `YYYYMMDD_XXXXXX_description.sql`
   - Date format: Year-Month-Day
   - Sequential number for multiple migrations on same day
   - Use snake_case for description

3. **Migration content**:
   - Include clear comments explaining changes
   - Provide both UP and DOWN (rollback) statements
   - Test rollback procedures before deploying

4. **Execution order**: 
   - Always run in chronological order (earliest first)
   - Do not skip migrations
   - Do not modify completed migrations
