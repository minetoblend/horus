const metadataKey = Symbol();

export interface CommandOptions {
  name: string;
  abbreviation?: string;
  description?: string;
  restricted?: boolean; //restricts the command to a designated bot channel
  usage?: string;
}

export function BotCommand(options: CommandOptions): MethodDecorator {
  return Reflect.metadata(metadataKey, options);
}

export function getCommandMetadata(instance, methodName: string) {
  return Reflect.getMetadata(metadataKey, instance, methodName) as CommandOptions;
}