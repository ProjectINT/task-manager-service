-- Function to auto-update updated_at timestamp on Task table
CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on Task updates
CREATE TRIGGER task_update_timestamp
BEFORE UPDATE ON "Task"
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

    UPDATE "TaskCounter"
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

    UPDATE "TaskCounter"
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

    UPDATE "TaskCounter"
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
AFTER INSERT ON "Task"
FOR EACH ROW
EXECUTE FUNCTION task_counter_after_insert();

CREATE TRIGGER task_counter_after_update
AFTER UPDATE OF status ON "Task"
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION task_counter_after_update();
CREATE TRIGGER task_counter_after_delete
AFTER DELETE ON "Task"
FOR EACH ROW
EXECUTE FUNCTION task_counter_after_delete();

-- Initialize counter with zero values
INSERT INTO "TaskCounter" (id, total, pending, in_progress, completed, cancelled, updated_at)
VALUES (0, 0, 0, 0, 0, 0, NOW())
ON CONFLICT (id) DO NOTHING;
