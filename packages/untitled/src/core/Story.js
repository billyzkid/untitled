class Story {
  constructor() {
    this.title = "";
    this.children = [];
  }

  input(text) {
    return `${text} ==> ${JSON.stringify(this)}`;
  }
}

export default Story;