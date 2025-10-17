-- Initial migration for task manager service
-- Optimized version with advisory locks and auto-updating timestamps

-- Task status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Main tasks table
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task counter table for real-time statistics
CREATE TABLE task_counter (
    id INTEGER PRIMARY KEY DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    pending INTEGER NOT NULL DEFAULT 0,
    in_progress INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    cancelled INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT task_counter_single_row CHECK (id = 0)
);

-- Indexes for optimized queries
CREATE INDEX task_status_idx ON task (status);
CREATE INDEX task_due_date_idx ON task (due_date);
CREATE INDEX task_created_at_idx ON task (created_at);

-- Initialize counter with zero values
INSERT INTO task_counter (id, total, pending, in_progress, completed, cancelled)
VALUES (0, 0, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Function to auto-update updated_at timestamp on task table
CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on task updates
CREATE TRIGGER task_update_timestamp
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_task_timestamp();

-- Function to update counter after task insert
-- Uses advisory lock to prevent contention and ensure consistency
CREATE OR REPLACE FUNCTION task_counter_after_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Advisory lock ensures serialized updates to counter
    -- Automatically released at transaction end (COMMIT/ROLLBACK)
    PERFORM pg_advisory_xact_lock(0);

    UPDATE task_counter
    SET
        total = total + 1,
        pending = pending + CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
        in_progress = in_progress + CASE WHEN NEW.status = 'in_progress' THEN 1 ELSE 0 END,
        completed = completed + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        cancelled = cancelled + CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE id = 0;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update counter after task status update
CREATE OR REPLACE FUNCTION task_counter_after_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Advisory lock ensures serialized updates to counter
    PERFORM pg_advisory_xact_lock(0);

    UPDATE task_counter
    SET
        pending = pending
            + CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END
            - CASE WHEN OLD.status = 'pending' THEN 1 ELSE 0 END,
        in_progress = in_progress
            + CASE WHEN NEW.status = 'in_progress' THEN 1 ELSE 0 END
            - CASE WHEN OLD.status = 'in_progress' THEN 1 ELSE 0 END,
        completed = completed
            + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END
            - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END,
        cancelled = cancelled
            + CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END
            - CASE WHEN OLD.status = 'cancelled' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE id = 0;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update counter after task delete
CREATE OR REPLACE FUNCTION task_counter_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Advisory lock ensures serialized updates to counter
    PERFORM pg_advisory_xact_lock(0);

    UPDATE task_counter
    SET
        total = GREATEST(total - 1, 0),
        pending = GREATEST(pending - CASE WHEN OLD.status = 'pending' THEN 1 ELSE 0 END, 0),
        in_progress = GREATEST(in_progress - CASE WHEN OLD.status = 'in_progress' THEN 1 ELSE 0 END, 0),
        completed = GREATEST(completed - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END, 0),
        cancelled = GREATEST(cancelled - CASE WHEN OLD.status = 'cancelled' THEN 1 ELSE 0 END, 0),
        updated_at = NOW()
    WHERE id = 0;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for maintaining counter consistency
CREATE TRIGGER task_counter_after_insert
AFTER INSERT ON task
FOR EACH ROW
EXECUTE FUNCTION task_counter_after_insert();

CREATE TRIGGER task_counter_after_update
AFTER UPDATE OF status ON task
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION task_counter_after_update();

CREATE TRIGGER task_counter_after_delete
AFTER DELETE ON task
FOR EACH ROW
EXECUTE FUNCTION task_counter_after_delete();

-- Example queries:
-- Get task statistics:
-- SELECT * FROM task_counter WHERE id = 0;
--
-- Create a task:
-- INSERT INTO task (title, description, status, due_date)
-- VALUES ('My Task', 'Task description', 'pending', NOW() + INTERVAL '7 days');
--
-- Update task status:
-- UPDATE task SET status = 'in_progress' WHERE id = '<uuid>';
--
-- Delete a task:
-- DELETE FROM task WHERE id = '<uuid>';
