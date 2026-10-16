import { Test } from '../models/Test.js';

export const getTests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { ownerId: req.userId };

    if (status) {
      filter.status = status;
    }

    const tests = await Test.find(filter).sort({ testDate: 1 });
    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error('Get tests error:', error);
    return res.status(500).json({ message: 'Error retrieving tests.' });
  }
};

export const createTest = async (req, res) => {
  try {
    const { title, subject, testDate, durationMinutes, location, description, preparationNotes, status } = req.body;

    if (!title || !subject || !testDate) {
      return res.status(400).json({ message: 'Title, subject, and test date are required.' });
    }

    const test = await Test.create({
      ownerId: req.userId,
      title: title.trim(),
      subject: subject.trim(),
      testDate: new Date(testDate),
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      location: location?.trim() || 'Room 101',
      description: description?.trim() || '',
      preparationNotes: preparationNotes?.trim() || '',
      status: status || 'upcoming',
    });

    return res.status(201).json({ success: true, test });
  } catch (error) {
    console.error('Create test error:', error);
    return res.status(500).json({ message: 'Error creating test.' });
  }
};

export const updateTest = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, ownerId: req.userId });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or access denied.' });
    }

    const { title, subject, testDate, durationMinutes, location, description, preparationNotes, status } = req.body;

    if (title !== undefined) test.title = title.trim();
    if (subject !== undefined) test.subject = subject.trim();
    if (testDate !== undefined) test.testDate = new Date(testDate);
    if (durationMinutes !== undefined) test.durationMinutes = Number(durationMinutes);
    if (location !== undefined) test.location = location.trim();
    if (description !== undefined) test.description = description.trim();
    if (preparationNotes !== undefined) test.preparationNotes = preparationNotes.trim();
    if (status !== undefined) test.status = status;

    await test.save();

    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error('Update test error:', error);
    return res.status(500).json({ message: 'Error updating test.' });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or access denied.' });
    }

    return res.status(200).json({ success: true, message: 'Test deleted successfully.' });
  } catch (error) {
    console.error('Delete test error:', error);
    return res.status(500).json({ message: 'Error deleting test.' });
  }
};
