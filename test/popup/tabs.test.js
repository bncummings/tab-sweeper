import tabsModule from '../../src/popup/tabs.js';
const { tabGroups, createGroup } = tabsModule;

test('can add new groups to tabgroups array', () => {
    expect(tabGroups.length).toBe(0);
    createGroup("TestGroup");
    expect(tabGroups.length).toBe(1);
    expect(tabGroups.map(g => g.name)).toContain("TestGroup");
});

test('can add uris to a tab group', () => {
    const testUris = [
        'https://developer.chrome.com/docs/webstore/*',
        'https://developer.chrome.com/docs/extensions/*'
    ];
    const testGroup = createGroup("GoogleGroup");
    testGroup.addUris(...testUris);
    expect(testGroup.uris.length).toBe(2);
    expect(testGroup.uris).toEqual(expect.arrayContaining(testUris));
})

test('can add uris to a tab group', () => {
    const testUris = [
        'https://developer.chrome.com/docs/webstore/*',
        'https://developer.chrome.com/docs/extensions/*'
    ];
    const testGroup = createGroup("GoogleGroup");
    testGroup.addUris(...testUris);
    expect(testGroup.uris.length).toBe(2);
    expect(testGroup.uris).toEqual(expect.arrayContaining(testUris));
})


test('empty test that always passes', () => {
    expect(true).toBe(true);
});
