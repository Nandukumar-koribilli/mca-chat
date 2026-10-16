import { Task } from '../models/Task.js';
import { Test } from '../models/Test.js';
import { Note } from '../models/Note.js';
import { Schedule } from '../models/Schedule.js';

export const getReportsSummary = async (req, res) => {
  try {
    const ownerId = req.userId;
    const now = new Date();

    const [tasks, tests, notes, schedules] = await Promise.all([
      Task.find({ ownerId }),
      Test.find({ ownerId }),
      Note.find({ ownerId }),
      Schedule.find({ ownerId }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const todoTasks = tasks.filter((t) => t.status === 'todo').length;
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const upcomingTests = tests.filter((t) => t.status === 'upcoming').length;
    const totalNotes = notes.length;
    const pinnedNotes = notes.filter((n) => n.isPinned).length;
    const totalClasses = schedules.length;

    // Subject breakdown
    const subjectMap = {};
    tasks.forEach((t) => {
      const subj = t.subject || 'General';
      if (!subjectMap[subj]) {
        subjectMap[subj] = { total: 0, done: 0 };
      }
      subjectMap[subj].total += 1;
      if (t.status === 'done') subjectMap[subj].done += 1;
    });

    const subjectStats = Object.keys(subjectMap).map((subject) => ({
      subject,
      total: subjectMap[subject].total,
      completed: subjectMap[subject].done,
      rate: Math.round((subjectMap[subject].done / subjectMap[subject].total) * 100),
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionRate,
        upcomingTests,
        totalNotes,
        pinnedNotes,
        totalClasses,
        subjectStats,
      },
    });
  } catch (error) {
    console.error('Reports summary error:', error);
    return res.status(500).json({ message: 'Error generating reports summary.' });
  }
};
