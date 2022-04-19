import { Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import internal from "stream";

export async function createPagination(message: Message, renderer: (offset: number, limit: number) => Promise<{ total: number, embed: MessageEmbed }>) {

  const perPage = 5;
  let page = 0;

  let { embed, total } = await renderer(page * perPage, perPage);
  let pages = Math.ceil(total / perPage);
  if (pages === 0)
    pages = 1;

  function createPaginationActions(currentPage: number, numPages: number) {
    const actionRow = new MessageActionRow();

    actionRow.addComponents(new MessageButton()
      .setStyle("SECONDARY")
      .setEmoji("⏪")
      .setCustomId("page:first")
      .setDisabled(currentPage === 0)
    );

    actionRow.addComponents(new MessageButton()
      .setStyle("SECONDARY")
      .setEmoji("◀️")
      .setCustomId("page:" + (currentPage - 1))
      .setDisabled(currentPage === 0)
    );

    actionRow.addComponents(new MessageButton()
      .setStyle("SECONDARY")
      .setEmoji("▶️")
      .setCustomId("page:" + (currentPage + 1))
      .setDisabled(currentPage >= numPages - 1)
    );

    actionRow.addComponents(new MessageButton()
      .setStyle("SECONDARY")
      .setEmoji("⏩")
      .setCustomId("page:last")
      .setDisabled(currentPage >= numPages - 1)
    );

    return actionRow;
  }

  const paginatedMessage = await message.reply({
    embeds: [embed],
    components: [createPaginationActions(page, pages)]
  });

  const collector = paginatedMessage.createMessageComponentCollector({
    componentType: "BUTTON",
    time: 30_000
  });

  collector.on("collect", async interaction => {
    if (interaction.customId.startsWith("page")) {

      if (interaction.user.id !== message.member.id) {
        return interaction.deferUpdate();
      }

      let [_, pageNumber] = interaction.customId.split(":");
      if (pageNumber === "first")
        pageNumber = "0";
      if (pageNumber === "last")
        pageNumber = (pages - 1).toString();

      page = parseInt(pageNumber);
      await interaction.deferUpdate({});

      let { embed, total } = await renderer(page * perPage, perPage);
      pages = Math.ceil(total / perPage);
      if (pages === 0)
        pages = 1;
      await paginatedMessage.edit({
        embeds: [embed],
        components: [createPaginationActions(page, pages)]
      });
    }
  });

  collector.on("end", async () => {
    let { embed, total } = await renderer(page * perPage, perPage);
    pages = Math.ceil(total / perPage);
    if (pages === 0)
      pages = 1;
    await paginatedMessage.edit({
      embeds: [embed],
      components: []
    });
  });

}