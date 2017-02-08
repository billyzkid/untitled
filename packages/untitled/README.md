# untitled

This package provides the core library and built-in extensions for use by story/extension authors.

## Installation

`npm install untitled --save`

## Usage

```javascript
import { Story } from "untitled"; // i.e. "react"
import { English } from "untitled-grammars"; // i.e. "react-dom"
import { Automobile } from "untitled-vehicles"; // i.e. "react-addons"

const myStory = new Story();
myStory.grammar = new English();
myStory.title = "My Story";
// ...

const driveway = new Place();
driveway.name = "driveway";
myStory.children.push(driveway);
// ...

const car = new Automobile();
car.name = "car";
driveway.children.push(car);
// ...

export default myStory;
```