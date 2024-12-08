interface IBasicClass {
  handleSomething: (args: string[]) => void;
}

class BasicClass implements IBasicClass {
  constructor() {}
  handleSomething = (args: string[]) => {};
}
