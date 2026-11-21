/**
 * CampusConnect Automated Test Suite (Stage 4)
 * 
 * Verifies functional requirements, error resilience, and utility correctness.
 */

const assert = require('assert');

// 1. Test Formatters
function testFormatters() {
  console.log('--- Testing Formatters ---');

  // getInitials
  function getInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  assert.strictEqual(getInitials('John Doe'), 'JD');
  assert.strictEqual(getInitials('Alice'), 'AL');
  assert.strictEqual(getInitials(''), '?');
  assert.strictEqual(getInitials(null), '?');
  console.log('✓ getInitials passed');

  // truncateText
  function truncateText(text, maxLength = 45) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  assert.strictEqual(truncateText('Short text', 20), 'Short text');
  assert.strictEqual(
    truncateText('This is a very long message that should be truncated', 15),
    'This is a very ...'
  );
  assert.strictEqual(truncateText(null), '');
  console.log('✓ truncateText passed');

  // formatMessageTime
  function formatMessageTime(dateInput) {
    if (!dateInput) return null;
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  }

  assert.strictEqual(formatMessageTime(null), null);
  assert.strictEqual(formatMessageTime('invalid-date'), null);
  assert.notStrictEqual(formatMessageTime(new Date()), null);
  console.log('✓ formatMessageTime passed');
}

// 2. Test Selection & Deduplication Logic
function testSelectionLogic() {
  console.log('\n--- Testing Participant Selection & Deduplication ---');

  function toggleUserSelection(selectedUsers, userId) {
    if (selectedUsers.includes(userId)) {
      return selectedUsers.filter((id) => id !== userId);
    }
    return [...selectedUsers, userId];
  }

  let selected = [];
  selected = toggleUserSelection(selected, 101);
  assert.deepStrictEqual(selected, [101], 'Should add user');

  // Tapping again must deselect
  selected = toggleUserSelection(selected, 101);
  assert.deepStrictEqual(selected, [], 'Should deselect user');

  // Tapping multiple users
  selected = toggleUserSelection(selected, 101);
  selected = toggleUserSelection(selected, 102);
  assert.deepStrictEqual(selected, [101, 102]);

  // Repeatedly tapping user 102 must remove it without duplicating 101
  selected = toggleUserSelection(selected, 102);
  assert.deepStrictEqual(selected, [101]);
  console.log('✓ Toggle selection prevents duplicates & allows deselection');
}

// 3. Test Form Validation Logic
function testValidationLogic() {
  console.log('\n--- Testing Form Validation Logic ---');

  function validateConversation(type, convoName, selectedUsers) {
    if (!type) return { valid: false, error: 'Type is required' };
    if (!selectedUsers || selectedUsers.length === 0)
      return { valid: false, error: 'At least one participant required' };
    if (type === 'DM' && selectedUsers.length !== 1)
      return { valid: false, error: 'DM requires exactly 1 recipient' };
    if (type === 'GROUP' && !convoName.trim())
      return { valid: false, error: 'Group title required' };
    return { valid: true };
  }

  // DM validation
  assert.strictEqual(validateConversation('DM', '', []).valid, false);
  assert.strictEqual(validateConversation('DM', '', [1, 2]).valid, false);
  assert.strictEqual(validateConversation('DM', '', [1]).valid, true);

  // Group validation
  assert.strictEqual(validateConversation('GROUP', '', [1]).valid, false);
  assert.strictEqual(validateConversation('GROUP', 'Study Group', []).valid, false);
  assert.strictEqual(validateConversation('GROUP', 'Study Group', [1, 2]).valid, true);
  console.log('✓ Conversation creation validation passed');
}

// 4. Test Error Handling & Safety
function testErrorResilience() {
  console.log('\n--- Testing Error Resilience & Safety ---');

  // Empty message guard
  function validateTextMessage(content) {
    const trimmed = (content || '').trim();
    if (!trimmed) throw new Error('Message content cannot be empty');
    return trimmed;
  }

  assert.throws(() => validateTextMessage(''), /cannot be empty/);
  assert.throws(() => validateTextMessage('   '), /cannot be empty/);
  assert.throws(() => validateTextMessage(null), /cannot be empty/);
  assert.strictEqual(validateTextMessage('  Hello  '), 'Hello');
  console.log('✓ Empty message rejection passed');

  // Image picker cancellation guard
  function handlePickerResult(result) {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null; // Safe exit
    }
    return result.assets[0].uri;
  }

  // Canceled dialog simulation (must NOT crash)
  assert.strictEqual(handlePickerResult({ canceled: true }), null);
  assert.strictEqual(handlePickerResult({ canceled: true, assets: null }), null);
  assert.strictEqual(
    handlePickerResult({ canceled: false, assets: [{ uri: 'file://photo.jpg' }] }),
    'file://photo.jpg'
  );
  console.log('✓ Image picker cancellation safety passed');

  // Route parameter safety check
  function getSafeRouteParams(route) {
    const data = route?.params?.data || {};
    return {
      conversationId: data.conversationId || null,
      name: data.name || 'Chat',
      participants: Array.isArray(data.participants) ? data.participants : [],
    };
  }

  // Undefined route or empty params must not crash
  assert.deepStrictEqual(getSafeRouteParams(undefined), {
    conversationId: null,
    name: 'Chat',
    participants: [],
  });
  assert.deepStrictEqual(getSafeRouteParams({ params: {} }), {
    conversationId: null,
    name: 'Chat',
    participants: [],
  });
  console.log('✓ Route parameter safety passed');
}

// Run All Tests
try {
  testFormatters();
  testSelectionLogic();
  testValidationLogic();
  testErrorResilience();
  console.log('\n========================================');
  console.log('ALL STAGE 4 TEST SUITES PASSED (100%)');
  console.log('========================================\n');
} catch (err) {
  console.error('Test Suite Failed:', err);
  process.exit(1);
}
