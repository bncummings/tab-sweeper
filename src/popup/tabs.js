const tabGroups = [];
const permissions = [];

class TabGroup {
  constructor(name) {
    this.name = name;
    this.uris = [];
  }

  addUris(...uris) {
    uris.forEach((uri) => {
      if (!this.uris.includes(uri)) {
      this.uris.push(uri);
      //update permissions
      } else {
        console.warn(`URI ${uri} already exists in group ${this.name}.`);
      }
    });
  }
}

// factory method for a new tabGroup
function createGroup(groupName) {
  if (!tabGroups.includes(groupName)) {
    const newGroup = new TabGroup(groupName)
    tabGroups.push(newGroup);
    return newGroup;
  } else {
    console.warn(`A group with name: \"${groupName}\" already exists.`);
  }
}

function removeGroup(groupName) {

}

function updatePermissions() {

}

function add(x, y) {
  return x + y;
}

export default  { tabGroups, createGroup };
