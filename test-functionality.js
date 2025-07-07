// Simple test to verify multi-prefix functionality
// This can be run in the browser console when the extension is loaded

// Test data to simulate custom groups
const testGroups = [
  {
    name: "React Documentation",
    urlPrefixes: ["https://react.dev/", "https://reactjs.org/", "https://legacy.reactjs.org/"]
  },
  {
    name: "Vue Documentation", 
    urlPrefixes: ["https://vuejs.org/", "https://v2.vuejs.org/"]
  }
];

// Test the storage functionality
async function testStorage() {
  console.log("Testing storage functionality...");
  
  // Store test groups
  await chrome.storage.local.set({ customGroups: testGroups });
  console.log("✓ Stored test groups");
  
  // Retrieve groups
  const result = await chrome.storage.local.get('customGroups');
  console.log("✓ Retrieved groups:", result.customGroups);
  
  // Verify multi-prefix support
  const reactGroup = result.customGroups.find(g => g.name === "React Documentation");
  if (reactGroup && reactGroup.urlPrefixes && reactGroup.urlPrefixes.length === 3) {
    console.log("✓ Multi-prefix support verified");
  } else {
    console.log("✗ Multi-prefix support failed");
  }
  
  console.log("Storage test complete!");
}

// Test URL matching (simulated)
function testUrlMatching() {
  console.log("Testing URL matching logic...");
  
  const testUrls = [
    "https://react.dev/learn",
    "https://reactjs.org/docs/getting-started.html",
    "https://legacy.reactjs.org/tutorial/tutorial.html",
    "https://vuejs.org/guide/",
    "https://v2.vuejs.org/v2/guide/",
    "https://example.com/other"
  ];
  
  testGroups.forEach(group => {
    const matchingUrls = testUrls.filter(url => 
      group.urlPrefixes.some(prefix => url.startsWith(prefix))
    );
    
    console.log(`Group "${group.name}" matches:`, matchingUrls);
  });
  
  console.log("URL matching test complete!");
}

// Run tests
console.log("Running functionality tests...");
testStorage();
testUrlMatching();
