-- 1. Add user_id to GOALS
ALTER TABLE goals ADD COLUMN user_id BIGINT;
-- For existing data (from seed), assign to user 1 (the one you just registered)
-- In a real production migration, this would need careful planning.
UPDATE goals SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE goals ADD CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 2. Add user_id to TASKS
ALTER TABLE tasks ADD COLUMN user_id BIGINT;
UPDATE tasks SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 3. Add user_id to TIME_BLOCKS
ALTER TABLE time_blocks ADD COLUMN user_id BIGINT;
UPDATE time_blocks SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE time_blocks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE time_blocks ADD CONSTRAINT fk_time_blocks_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 4. Add user_id to REMINDERS
ALTER TABLE reminders ADD COLUMN user_id BIGINT;
UPDATE reminders SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE reminders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reminders ADD CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 5. Add user_id to TASK_ACTIVITY_LOGS
ALTER TABLE task_activity_logs ADD COLUMN user_id BIGINT;
UPDATE task_activity_logs SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE task_activity_logs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE task_activity_logs ADD CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Indexes for performance (CRITICAL for isolation queries)
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_time_blocks_user_id ON time_blocks(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_logs_user_id ON task_activity_logs(user_id);