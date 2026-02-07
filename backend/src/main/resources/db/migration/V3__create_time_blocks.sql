CREATE TABLE time_blocks (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CONSTRAINT fk_timeblock_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
);