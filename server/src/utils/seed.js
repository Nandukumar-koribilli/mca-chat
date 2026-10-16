import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Schedule } from '../models/Schedule.js';
import { Test } from '../models/Test.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear existing collections for a clean, deterministic demo
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Note.deleteMany({}),
      Schedule.deleteMany({}),
      Test.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data.');

    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const users = await User.create([
      {
        username: 'katemalone',
        normalizedUsername: 'katemalone',
        passwordHash: defaultPassword,
        displayName: 'Kate Malone',
        className: 'Class 9A / MCA Sem 2',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        bio: 'MCA Student | Passionate about full-stack web and algorithms',
      },
      {
        username: 'priya456',
        normalizedUsername: 'priya456',
        passwordHash: defaultPassword,
        displayName: 'Priya Sharma',
        className: 'MCA Sem 2',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        bio: 'AI enthusiast & MCA classmate',
      },
      {
        username: 'arjun123',
        normalizedUsername: 'arjun123',
        passwordHash: defaultPassword,
        displayName: 'Arjun Verma',
        className: 'MCA Sem 2',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        bio: 'Database systems & backend engineering',
      },
      {
        username: 'nandu',
        normalizedUsername: 'nandu',
        passwordHash: defaultPassword,
        displayName: 'Nandu Kumar',
        className: 'MCA Sem 2',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        bio: 'Full Stack Developer & Student Admin',
      },
    ]);

    const kate = users[0];
    const priya = users[1];
    const arjun = users[2];
    const nandu = users[3];

    console.log('[Seed] Created students:', users.map((u) => u.username).join(', '));

    // 2. Create Tasks for Kate Malone (Matching exact UI reference image)
    await Task.create([
      {
        ownerId: kate._id,
        title: 'Read poem & answer questions',
        description: 'Analyze stanza 3-5 and draft short responses for Monday tutorial.',
        subject: 'English Literature',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-04-28'),
        commentsCount: 12,
        progressPercent: 48,
      },
      {
        ownerId: kate._id,
        title: 'Create a comic strip with a story',
        description: 'Illustrate industrial revolution key milestones in 6 panels.',
        subject: 'Social Studies',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2025-05-17'),
        commentsCount: 0,
        progressPercent: 0,
      },
      {
        ownerId: kate._id,
        title: 'Prepare for the math test',
        description: 'Review quadratic equations, linear systems, and mock problems.',
        subject: 'Math',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2025-05-11'),
        commentsCount: 2,
        progressPercent: 0,
      },
      {
        ownerId: kate._id,
        title: 'Read poem & answer questions',
        description: 'Literature assignment part 2 - Romantic period poetry summary.',
        subject: 'English Literature',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2025-04-28'),
        commentsCount: 12,
        progressPercent: 0,
      },
      {
        ownerId: kate._id,
        title: 'Read the chapter about plant and animal',
        description: 'Cell division, mitosis vs meiosis differences, diagram practice.',
        subject: 'Biology',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2025-04-22'),
        commentsCount: 3,
        progressPercent: 0,
      },
    ]);
    console.log('[Seed] Created reference tasks.');

    // 3. Create Notes for Kate Malone (Matching exact UI reference image colors & text)
    await Note.create([
      {
        ownerId: kate._id,
        title: 'Math conspect',
        content:
          'A linear equation is an equation of the form: ax+b=cax + b = cax+b=c, where xxx is the variable, aaa, bbb, and ccc are constants, and a \\neq 0a = 0.',
        color: 'green',
        isPinned: true,
        category: 'Math',
      },
      {
        ownerId: kate._id,
        title: 'Biology conspect',
        content:
          'A cell is the basic structural, functional, and biological unit of all living organisms. It is the smallest unit capable of performing life functions.',
        color: 'lavender',
        isPinned: true,
        category: 'Biology',
      },
      {
        ownerId: kate._id,
        title: 'MCA Project Brainstorming',
        content:
          'EduConnect feature wishlist: Socket.io real-time chat, responsive calendar, instant task status toggling, and clean visual cards.',
        color: 'amber',
        isPinned: false,
        category: 'Project',
      },
    ]);
    console.log('[Seed] Created reference notes.');

    // 4. Create Schedule for Kate Malone (Matching exact UI reference image rows)
    await Schedule.create([
      {
        ownerId: kate._id,
        time: '8:30 AM',
        lesson: 'Math',
        teacher: 'Mrs. Goodman',
        teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        location: 'B3, Room 124',
        dayOfWeek: 'Monday',
        date: new Date('2025-05-14'),
      },
      {
        ownerId: kate._id,
        time: '8:30 AM',
        lesson: 'Math',
        teacher: 'Mrs. Goodman',
        teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        location: 'B3, Room 124',
        dayOfWeek: 'Monday',
        date: new Date('2025-05-14'),
      },
      {
        ownerId: kate._id,
        time: '10:30 AM',
        lesson: 'ELA',
        teacher: 'Ms. Melton',
        teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        location: 'B2, Room 158',
        dayOfWeek: 'Monday',
        date: new Date('2025-05-14'),
      },
      {
        ownerId: kate._id,
        time: '12:00 PM',
        lesson: 'Biology',
        teacher: 'Mr. Hodge',
        teacherAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        location: 'B3, Room 310',
        dayOfWeek: 'Monday',
        date: new Date('2025-05-14'),
      },
      {
        ownerId: kate._id,
        time: '02:00 PM',
        lesson: 'Social Studies',
        teacher: 'Mrs. Murray',
        teacherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80',
        location: 'B1, Room 112',
        dayOfWeek: 'Monday',
        date: new Date('2025-05-14'),
      },
    ]);
    console.log('[Seed] Created reference timetable.');

    // 5. Create Tests for Kate Malone
    await Test.create([
      {
        ownerId: kate._id,
        title: 'Linear Algebra & Calculus Midterm',
        subject: 'Math',
        testDate: new Date('2025-05-18T10:00:00Z'),
        durationMinutes: 90,
        location: 'Hall B, Desk 42',
        description: 'Comprehensive test covering matrices, eigenvalues, and limits.',
        preparationNotes: 'Solve exercises 4.1 through 4.9 from textbook.',
        status: 'upcoming',
      },
      {
        ownerId: kate._id,
        title: 'Cellular Biology Quiz',
        subject: 'Biology',
        testDate: new Date('2025-05-24T14:00:00Z'),
        durationMinutes: 45,
        location: 'Science Lab 3',
        description: 'Quiz on plant vs animal cell organelles and osmosis.',
        preparationNotes: 'Review microscope lab drawings.',
        status: 'upcoming',
      },
    ]);
    console.log('[Seed] Created test entries.');

    // 6. Create Group Conversation (MCA Cohort Discussion)
    const cohortGroup = await Conversation.create({
      type: 'group',
      title: 'MCA Cohort Discussion',
      description: 'Official group chat for MCA students, schedule announcements, and study collabs.',
      participantIds: [kate._id, priya._id, arjun._id, nandu._id],
      createdBy: nandu._id,
      lastMessage: {
        content: 'Hey everyone! Welcome to the EduConnect platform.',
        senderId: nandu._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversationId: cohortGroup._id,
        senderId: nandu._id,
        content: 'Welcome to EduConnect! Everything is connected to our MongoDB Atlas cloud.',
        readBy: [nandu._id, kate._id],
      },
      {
        conversationId: cohortGroup._id,
        senderId: arjun._id,
        content: 'Awesome! Did anyone check the Math timetable for Monday?',
        readBy: [arjun._id, kate._id],
      },
      {
        conversationId: cohortGroup._id,
        senderId: priya._id,
        content: 'Yes, Mrs. Goodman will be in Room 124 at 8:30 AM!',
        readBy: [priya._id, kate._id],
      },
    ]);

    // 7. Create Direct Conversation between Kate and Priya
    const directKey = [kate._id.toString(), priya._id.toString()].sort().join('_');
    const directConv = await Conversation.create({
      type: 'direct',
      directKey,
      participantIds: [kate._id, priya._id],
      createdBy: priya._id,
      lastMessage: {
        content: 'Can you share your Biology conspect notes?',
        senderId: priya._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversationId: directConv._id,
        senderId: priya._id,
        content: 'Hey Kate! Can you share your Biology conspect notes?',
        readBy: [priya._id, kate._id],
      },
      {
        conversationId: directConv._id,
        senderId: kate._id,
        content: 'Sure! I just added them to My notes card on the dashboard.',
        readBy: [kate._id],
      },
    ]);

    console.log('[Seed] Completed successfully! All test accounts created.');
    console.log('[Seed] Demo accounts password: "password123"');
    console.log('[Seed] Available usernames: katemalone, priya456, arjun123, nandu');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
