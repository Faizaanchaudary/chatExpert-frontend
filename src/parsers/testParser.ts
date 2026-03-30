import {
  buildMediaFilesMap,
  parseWhatsAppChatText,
  parseWhatsAppChatTextDetailed,
} from './whatsappParser';

function assert(condition: any, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual(a: any, b: any, message: string) {
  if (a !== b) throw new Error(`${message}\nExpected: ${String(b)}\nActual: ${String(a)}`);
}

function runTest1_basicOrder() {
  const txt = [
    '[12/05/24, 10:22] A: Hello',
    '[12/05/24, 10:23] B: Hi',
    '[12/05/24, 10:24] C: IMG-1234.jpg (file attached)',
    '[12/05/24, 10:25] D: Nice',
  ].join('\n');

  const mediaFiles = [{ name: 'IMG-1234.jpg', path: '/local/path/IMG-1234.jpg' }];
  const map = buildMediaFilesMap(mediaFiles);
  const { messages, mediaLinked } = parseWhatsAppChatText(txt, map);

  assertEqual(messages.length, 4, 'Test1: expected 4 messages');
  assertEqual(messages[0].sender, 'A', 'Test1: msg1 sender');
  assertEqual(messages[1].sender, 'B', 'Test1: msg2 sender');
  assertEqual(messages[2].sender, 'C', 'Test1: msg3 sender');
  assertEqual(messages[3].sender, 'D', 'Test1: msg4 sender');

  assertEqual(messages[2].type, 'image', 'Test1: media type detection');
  assert(!!messages[2].mediaUri, 'Test1: media should be linked');
  assertEqual(mediaLinked, 1, 'Test1: mediaLinked should be 1');

  // Ensure deterministic ID sequence
  assertEqual(messages[0].id, 'wa-0', 'Test1: msg1 id deterministic');
  assertEqual(messages[3].id, 'wa-3', 'Test1: msg4 id deterministic');

  console.log('✅ Test 1 passed');
}

function runTest2_multiline() {
  const txt = [
    '[12/05/24, 10:22] A: Hello',
    'How are you',
    'I am fine',
    '[12/05/24, 10:23] B: OK',
  ].join('\n');

  const { messages } = parseWhatsAppChatText(txt, {});
  assertEqual(messages.length, 2, 'Test2: expected 2 messages');
  assertEqual(
    messages[0].text,
    'Hello\nHow are you\nI am fine',
    'Test2: multiline append should preserve newlines',
  );
  assertEqual(messages[1].text, 'OK', 'Test2: second message text');
  console.log('✅ Test 2 passed');
}

function runTest3_stress1000() {
  const lines: string[] = [];
  for (let i = 0; i < 1000; i++) {
    const mm = String((i % 59) + 1).padStart(2, '0');
    lines.push(`[12/05/24, 10:${mm}] A: msg-${i}`);
  }
  const txt = lines.join('\n');

  const t0 = Date.now();
  const { messages } = parseWhatsAppChatText(txt, {});
  const t1 = Date.now();

  assertEqual(messages.length, 1000, 'Test3: expected 1000 messages');
  assertEqual(messages[0].text, 'msg-0', 'Test3: first message text');
  assertEqual(messages[999].text, 'msg-999', 'Test3: last message text');

  // order is exact (line i -> message i)
  for (let i = 0; i < 50; i++) {
    assertEqual(messages[i].id, `wa-${i}`, 'Test3: deterministic IDs preserve order');
  }

  console.log(`✅ Test 3 passed (1000 messages) in ${t1 - t0}ms`);
}

function runTest4_dashFormat() {
  const txt = [
    '17/07/2025, 12:32 pm - A: Hello',
    '17/07/2025, 12:33\u202Fpm - B: IMG-777.jpg (file attached)',
    '17/07/2025, 12:34 PM - A: Done',
  ].join('\n');

  const map = buildMediaFilesMap([{ name: 'IMG-777.jpg', path: '/m/IMG-777.jpg' }]);
  const { messages, mediaLinked } = parseWhatsAppChatText(txt, map);

  assertEqual(messages.length, 3, 'Test4: expected 3 messages');
  assertEqual(messages[0].sender, 'A', 'Test4: msg1 sender');
  assertEqual(messages[1].sender, 'B', 'Test4: msg2 sender');
  assertEqual(messages[1].type, 'image', 'Test4: msg2 type image');
  assert(!!messages[1].mediaUri, 'Test4: msg2 media linked');
  assertEqual(mediaLinked, 1, 'Test4: mediaLinked should be 1');
  assertEqual(messages[2].sender, 'A', 'Test4: msg3 sender');
  console.log('✅ Test 4 passed (dash format)');
}

/**
 * Optional: local manual runner.
 * In RN you can import and call `runWhatsappParserTests()` from a debug screen.
 */
export function runWhatsappParserTests() {
  runTest1_basicOrder();
  runTest2_multiline();
  runTest3_stress1000();
  runTest4_dashFormat();

  // Extra visibility for integration (detailed parser)
  const example = '[12/05/24, 10:22] A: IMG-1234.jpg (file attached)';
  const map = buildMediaFilesMap([{ name: 'IMG-1234.jpg', path: '/x/IMG-1234.jpg' }]);
  const detailed = parseWhatsAppChatTextDetailed(example, map);
  console.log('Messages parsed:', detailed.messages.length);
  console.log('Media linked:', detailed.mediaLinked);
}

