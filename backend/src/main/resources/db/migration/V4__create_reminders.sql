CREATE TABLE reminders (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    remind_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_reminder_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
);
