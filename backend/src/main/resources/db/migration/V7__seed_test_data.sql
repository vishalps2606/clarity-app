-- 1. Create Goals
INSERT INTO goals (title, status, priority, created_at) VALUES
                                                            ('Build Clarity Backend', 'ACTIVE', 'P0', NOW()),
                                                            ('Fitness & Health', 'ACTIVE', 'P1', NOW());

-- 2. Create Tasks
-- Task 1: DONE (History test) linked to Goal 1
INSERT INTO tasks (title, status, due_datetime, estimated_minutes, actual_minutes, goal_id, needs_review, created_at)
VALUES ('Setup Spring Boot', 'DONE', NOW() - INTERVAL '2 DAYS', 60, 45, 1, FALSE, NOW() - INTERVAL '3 DAYS');

-- Task 2: IN_PROGRESS (Time Block test) linked to Goal 1
INSERT INTO tasks (title, status, due_datetime, estimated_minutes, goal_id, needs_review, created_at)
VALUES ('Implement Activity Logs', 'IN_PROGRESS', NOW() + INTERVAL '1 DAY', 120, 1, FALSE, NOW() - INTERVAL '1 DAY');

-- Task 3: READY but OVERDUE (Scheduler test) linked to Goal 1
INSERT INTO tasks (title, status, due_datetime, estimated_minutes, goal_id, needs_review, created_at)
VALUES ('Write Unit Tests', 'READY', NOW() - INTERVAL '1 HOUR', 90, 1, FALSE, NOW() - INTERVAL '2 DAYS');

-- Task 4: SKIPPED (Review Decision test) linked to Goal 2
INSERT INTO tasks (title, status, due_datetime, estimated_minutes, goal_id, needs_review, review_note, review_decision, created_at)
VALUES ('Morning Run', 'SKIPPED', NOW() - INTERVAL '1 DAY', 30, 2, FALSE, 'Rained heavily', 'DROP', NOW() - INTERVAL '2 DAYS');

-- 3. Create Time Blocks
-- Allocate 2 hours today for Task 2
INSERT INTO time_blocks (task_id, start_time, end_time)
VALUES (2, NOW() + INTERVAL '1 HOUR', NOW() + INTERVAL '3 HOURS');

-- 4. Create Reminders
-- Reminder for Task 2 (Pending)
INSERT INTO reminders (task_id, remind_at, status)
VALUES (2, NOW() + INTERVAL '30 MINUTES', 'PENDING');

-- 5. Create Activity Logs
-- Log for Task 1 completion
INSERT INTO task_activity_logs (task_id, action, performed_by, metadata, created_at)
VALUES
    (1, 'TASK_CREATED', 'USER', '{"initial_status": "READY"}', NOW() - INTERVAL '3 DAYS'),
    (1, 'STATUS_UPDATE', 'USER', '{"old": "IN_PROGRESS", "new": "DONE"}', NOW() - INTERVAL '2 DAYS');

-- Log for Task 4 Review Decision
INSERT INTO task_activity_logs (task_id, action, performed_by, metadata, created_at)
VALUES
    (4, 'TASK_REVIEWED', 'USER', '{"decision": "DROP", "reason": "Weather"}', NOW() - INTERVAL '1 DAY');