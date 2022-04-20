import { Message, MessageComponentInteraction } from "discord.js";
import { MessageComponentTypes } from "discord.js/typings/enums";

export function createTemporaryButtonCollector(message: Message, time: number, onCollect: (interaction: MessageComponentInteraction, dispose: () => void) => Promise<boolean | string>) {

  const collector = message.createMessageComponentCollector({
    time,
    componentType: MessageComponentTypes.BUTTON,
    dispose: true
  });

  let resolved = false;

  async function resolve(text?: string) {
    if (resolved)
      return;
    resolved = true;
    await message.edit({
      content: text || (!message.content.length ? undefined : message.content),
      embeds: message.embeds,
      components: [],
      attachments: message.attachments.map(it => it)
    });

  }

  collector.on("collect", async interaction => {
    const remove = await onCollect(interaction, () => {
      console.log("should dispose");
      collector.dispose(interaction);
    });
    console.log(remove)
    if (remove)
      await resolve(typeof remove === "string" ? remove : undefined);

  });

  collector.on("end", async () => {
    await resolve();
  });
}