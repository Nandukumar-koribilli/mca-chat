import { Schedule } from '../models/Schedule.js';

export const getSchedule = async (req, res) => {
  try {
    const { dayOfWeek, date } = req.query;
    const filter = { ownerId: req.userId };

    if (dayOfWeek) {
      filter.dayOfWeek = dayOfWeek;
    }

    const items = await Schedule.find(filter).sort({ time: 1 });
    return res.status(200).json({ success: true, schedule: items });
  } catch (error) {
    console.error('Get schedule error:', error);
    return res.status(500).json({ message: 'Error retrieving timetable.' });
  }
};

export const createScheduleItem = async (req, res) => {
  try {
    const { time, lesson, teacher, teacherAvatar, location, dayOfWeek, date } = req.body;

    if (!time || !lesson || !teacher || !location) {
      return res.status(400).json({ message: 'Time, lesson, teacher, and location are required.' });
    }

    const item = await Schedule.create({
      ownerId: req.userId,
      time: time.trim(),
      lesson: lesson.trim(),
      teacher: teacher.trim(),
      teacherAvatar: teacherAvatar || '',
      location: location.trim(),
      dayOfWeek: dayOfWeek || 'Monday',
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json({ success: true, scheduleItem: item });
  } catch (error) {
    console.error('Create schedule error:', error);
    return res.status(500).json({ message: 'Error creating schedule item.' });
  }
};

export const updateScheduleItem = async (req, res) => {
  try {
    const item = await Schedule.findOne({ _id: req.params.id, ownerId: req.userId });

    if (!item) {
      return res.status(404).json({ message: 'Schedule item not found or access denied.' });
    }

    const { time, lesson, teacher, teacherAvatar, location, dayOfWeek, date } = req.body;

    if (time !== undefined) item.time = time.trim();
    if (lesson !== undefined) item.lesson = lesson.trim();
    if (teacher !== undefined) item.teacher = teacher.trim();
    if (teacherAvatar !== undefined) item.teacherAvatar = teacherAvatar;
    if (location !== undefined) item.location = location.trim();
    if (dayOfWeek !== undefined) item.dayOfWeek = dayOfWeek;
    if (date !== undefined) item.date = new Date(date);

    await item.save();

    return res.status(200).json({ success: true, scheduleItem: item });
  } catch (error) {
    console.error('Update schedule error:', error);
    return res.status(500).json({ message: 'Error updating schedule item.' });
  }
};

export const deleteScheduleItem = async (req, res) => {
  try {
    const item = await Schedule.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });

    if (!item) {
      return res.status(404).json({ message: 'Schedule item not found or access denied.' });
    }

    return res.status(200).json({ success: true, message: 'Schedule item deleted successfully.' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return res.status(500).json({ message: 'Error deleting schedule item.' });
  }
};
