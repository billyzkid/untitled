import { Story } from "untitled";
import { English } from "untitled-grammars";
import { Automobile } from "untitled-vehicles";

const myStory = new Story();
myStory.grammar = new English();
myStory.title = "Example Story";

const driveway = new Place();
driveway.name = "driveway";
myStory.children.push(driveway);

const car = new Automobile();
car.name = "car";
driveway.children.push(car);

export default myStory;