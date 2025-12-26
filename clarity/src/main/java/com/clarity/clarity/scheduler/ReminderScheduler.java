package com.clarity.clarity.scheduler;

import com.clarity.clarity.domain.Reminder;
import com.clarity.clarity.domain.ReminderStatus;
import com.clarity.clarity.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@EnableScheduling
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderRepository reminderRepository;

    @Scheduled(fixedDelay = 60000) // every minute
    @Transactional
    public void processReminders() {

        List<Reminder> dueReminders =
                reminderRepository.findByRemindAtBeforeAndStatus(
                        LocalDateTime.now(),
                        ReminderStatus.PENDING
                );

        for (Reminder reminder : dueReminders) {
            // FOR NOW: log only
            System.out.println(
                    "🔔 Reminder: Task '" +
                            reminder.getTask().getTitle() +
                            "' is due soon!"
            );

            reminder.setStatus(ReminderStatus.SENT);
        }
    }
}

