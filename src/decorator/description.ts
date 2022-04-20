const symbol = Symbol("description");

export function Description(description: string): MethodDecorator {
  return Reflect.metadata(symbol, description);
}