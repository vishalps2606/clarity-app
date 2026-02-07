CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(10) NOT NULL,
    status VARCHAR(15) NOT NULL,
    target_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    due_datetime TIMESTAMP,
    estimated_minutes INT,
    actual_minutes INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_goal
        FOREIGN KEY (goal_id)
        REFERENCES goals (id)
        ON DELETE CASCADE
);
