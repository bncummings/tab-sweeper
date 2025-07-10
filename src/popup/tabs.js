const tabGroups = [];

class TabGroup {
  constructor(name) {
    this.name = name;
    this.uris = [];
  }

  addUris(...uris) {
    uris.forEach((uri) => {
      if (!this.uris.includes(uri)) {
        this.uris.push(uri);
      } else {
        console.warn(`URI ${uri} already exists in group ${this.name}.`);
      }
    });
  }
}

export const createGroup = (groupName) => {
  if (!tabGroups.includes(groupName)) {
    const newGroup = new TabGroup(groupName);
    tabGroups.push(newGroup);
    return newGroup;
  } else {
    console.warn(`A group with name: "${groupName}" already exists.`);
  }
};

export default { tabGroups, createGroup };
