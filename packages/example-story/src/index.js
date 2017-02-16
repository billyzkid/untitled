import { Story } from "untitled";
import { English } from "untitled-grammars";

const story = new Story();
story.grammar = new English();
story.title = "Example Story";

const bedroom = new Place();
bedroom.name = "your bedroom";
story.children.push(bedroom);

const you = new Person();
you.name = "you";
bedroom.children.push(you);

const wallet = new Thing();
wallet.name = "your wallet";
you.children.push(wallet);

export default story;