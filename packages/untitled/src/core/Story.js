class Story {
  constructor() {
    this.title = "";
    this.children = [];
  }

  ask(text) {
    return `${text} ==> ${JSON.stringify(this)}`;
  }
}

export default Story;