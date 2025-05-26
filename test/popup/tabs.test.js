const { tabGroups, addGroup }  = require('../../src/popup/tabs.js');

test('can add new groups to tabgroups array', () => {
    expect(tabGroups.length).toBe(0);
    addGroup("TestGroup");
    expect(tabGroups.length).toBe(1);
    expect(tabGroups.map(g => g.name)).toContain("TestGroup");
});

test('empty test that always passes', () => {
    expect(true).toBe(true);
});
