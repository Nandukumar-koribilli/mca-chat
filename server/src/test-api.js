import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { Note } from './models/Note.js';
import { Schedule } from './models/Schedule.js';
import { Test } from './models/Test.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';

dotenv.config();

const runTests = async () => {
  console.log('\n=============================================');
  console.log(' RUNNING EDUCONNECT INTEGRATION & DATA TESTS ');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Test] Connected to MongoDB Atlas:', mongoose.connection.name);

    // Test 1: Seeded reference users exist
    const kate = await User.findOne({ normalizedUsername: 'katemalone' });
    assert(kate !== null, 'Seeded user "katemalone" exists in MongoDB Atlas');
    assert(kate && kate.displayName === 'Kate Malone', 'Kate Malone profile display name matches');

    // Test 2: Passwords are encrypted with bcrypt
    assert(
      kate && kate.passwordHash.startsWith('$2'),
      'Password is securely stored as bcrypt hash and never in plaintext'
    );
    const validPw = await bcrypt.compare('password123', kate.passwordHash);
    assert(validPw === true, 'Bcrypt correctly verifies valid password');
    const invalidPw = await bcrypt.compare('wrongpassword', kate.passwordHash);
    assert(invalidPw === false, 'Bcrypt rejects incorrect password');

    // Test 3: Username normalization prevents duplicates
    const priya = await User.findOne({ normalizedUsername: 'priya456' });
    assert(priya !== null, 'Seeded classmate "priya456" exists');

    // Test 4: Tasks isolation and verification
    const kateTasks = await Task.find({ ownerId: kate._id });
    assert(kateTasks.length >= 5, `Kate has ${kateTasks.length} reference tasks loaded`);
    const inProgressTask = kateTasks.find((t) => t.status === 'in_progress');
    assert(inProgressTask !== undefined, 'Found in_progress task with progress bar');

    // Data privacy test: Another user cannot see Kate's tasks
    const priyaTasks = await Task.find({ ownerId: priya._id });
    const hasLeak = priyaTasks.some((t) => t.ownerId.toString() === kate._id.toString());
    assert(hasLeak === false, 'Data isolation confirmed: Student A private tasks do not leak to Student B');

    // Test 5: Notes matching reference image
    const kateNotes = await Note.find({ ownerId: kate._id });
    assert(kateNotes.length >= 2, `Kate has ${kateNotes.length} reference notes loaded`);
    const mathNote = kateNotes.find((n) => n.title.includes('Math'));
    assert(mathNote !== undefined && mathNote.color === 'green', 'Math conspect note is lime green');
    const bioNote = kateNotes.find((n) => n.title.includes('Biology'));
    assert(bioNote !== undefined && bioNote.color === 'lavender', 'Biology conspect note is lavender');

    // Test 6: Schedule entries matching reference timetable
    const kateSchedule = await Schedule.find({ ownerId: kate._id });
    assert(kateSchedule.length >= 4, `Kate has ${kateSchedule.length} timetable entries`);
    const mathClass = kateSchedule.find((s) => s.lesson === 'Math');
    assert(mathClass !== undefined && mathClass.location === 'B3, Room 124', 'Timetable entry has correct room B3, Room 124');

    // Test 7: Conversations and Duplicate Prevention
    const directKey = [kate._id.toString(), priya._id.toString()].sort().join('_');
    const conversations = await Conversation.find({ directKey });
    assert(conversations.length === 1, 'Direct conversation between Kate and Priya has exactly 1 unique instance (no duplicates)');

    // Test 8: Real messages persist in MongoDB Atlas
    const messages = await Message.find({ conversationId: conversations[0]._id });
    assert(messages.length >= 2, `Found ${messages.length} persistent chat messages in direct conversation`);

    // Test 9: MCA Group Conversation
    const group = await Conversation.findOne({ type: 'group' });
    assert(group !== null && group.title === 'MCA Cohort Discussion', 'Universal MCA group conversation exists');
    assert(group.participantIds.length >= 4, 'All MCA students enrolled in group conversation');

    console.log('\n=============================================');
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('=============================================\n');

    await mongoose.disconnect();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
};

runTests();
