# untitled-core

> Core library and extensions for [Untitled](https://billyzkid.github.io/untitled/) authors and developers

This package includes the following:

* TODO

## Installation

Install the package dependency.

```sh
npm install --save untitled-core
```

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
