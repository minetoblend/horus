import { Injectable, OnModuleInit } from "@nestjs/common";
import { On } from "@discord-nestjs/core";
import { Message } from "discord.js";
import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { IsObject } from "@discord-nestjs/core/dist/utils/function/is-object";
import { CommandOptions, getCommandMetadata } from "../decorator/bot.command";
import { GuildService } from "./guid.service";
import { MemberService } from "./member.service";

interface Command {
  instance: any;
  methodName: string;
  options: CommandOptions;
}

@Injectable()
export class CommandGateway implements OnModuleInit {

  readonly commands: Command[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly guildService: GuildService,
    private readonly memberService: MemberService
  ) {
  }

  @On("messageCreate")
  async onMessageCreate(message: Message) {
    const guild = await this.guildService.getFromGuild(message.guild);
    let prefix = guild?.prefix;
    if (!guild)
      prefix = "$";
    const content = message.content.trim();
    if (content.startsWith(prefix)) {
      for (let command of this.commands) {
        const { name, abbreviation, restricted } = command.options;

        const [invokedCommand] = content.split(" ");

        if (invokedCommand === (prefix + name) || (
          abbreviation && invokedCommand === prefix + abbreviation
        )) {
          const member = await this.memberService.getOrCreateFromMember(message.member);
          if (restricted) {
            if (!guild || !guild.botChannel)
              return message.reply(`No bot channel set. Use ${prefix}set to set a bot channel.`);
            else if (message.channelId !== guild.botChannel)
              return message.channel.send(`${message.member.toString()}, the \`${name}\` command is restricted in this channel.`);

            return command.instance[command.methodName](message, member, guild);
          }
          return command.instance[command.methodName](message, member, guild);
        }
      }
    }
  }

  async onModuleInit() {
    const providers = this.discoveryService.getProviders();
    this.setupCommands(providers);
  }

  setupCommands(providers: InstanceWrapper[]) {
    providers.forEach(({ instance }) => {
      if (!instance || !IsObject(instance)) return;

      const methodNames = this.scanMetadata(instance);

      methodNames.forEach(methodName => {
        const metadata = getCommandMetadata(instance, methodName);
        if (!metadata)
          return;
        this.commands.push({
          instance,
          methodName,
          options: metadata
        });
      });
    });

  }

  private scanMetadata(instance: any): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName
    );
  }

}