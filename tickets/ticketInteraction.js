const {
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const hastebin = require("hastebin");
const { createTicketEmbed } = require("./ticketHandler.js");

const userDepartments = new Map();

function handleTicketInteraction(interaction) {
  if (!interaction.isSelectMenu() && !interaction.isButton()) return;

  if (interaction.customId === "ticketMenu") {
    const selectedDept = interaction.values[0];
    const categoryID = process.env.TICKET_CATEGORY_ID;
    const roleID = process.env.TICKET_ROLE_ID;
    const welcomeMessage = `Bem-vindo ao canal de suporte ${selectedDept}!`;
    const member = interaction.member;
    const guild = interaction.guild;

    if (!categoryID || !roleID) {
      interaction.reply(
        "A categoria de suporte não foi configurada corretamente."
      );
      return;
    }

    const category = guild.channels.cache.get(categoryID);
    const role = guild.roles.cache.get(roleID);

    if (!category || !role) {
      interaction.reply(
        "A categoria ou o cargo de suporte não foi encontrado."
      );
      return;
    }

    if (userDepartments.has(member.id)) {
      interaction.reply("Você já possui um ticket em aberto.");
      return;
    }

    const overwrites = [
      { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
      { id: roleID, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
      { id: member.id, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
    ];

    guild.channels
      .create(`${selectedDept}-${member.user.username}`, {
        type: "text",
        parent: categoryID,
        permissionOverwrites: overwrites,
      })
      .then((channel) => {
        const ticketEmbed = new MessageEmbed()
          .setTitle("Suporte solicitado")
          .setDescription(welcomeMessage)
          .addField("Aberto por", member.user.tag)
          .addField("Quem poderá ajudar", `<@&${roleID}>`)
          .setColor("#00ff00");

        const closeButton = new MessageButton()
          .setCustomId("closeTicket")
          .setLabel("Fechar Ticket")
          .setStyle("DANGER");

        const row = new MessageActionRow().addComponents(closeButton);

        channel.send({
          content: `<@${member.user.id}>, <@&${roleID}>`,
          embeds: [ticketEmbed],
          components: [row],
        });

        const ticketOpenEmbed = new MessageEmbed()
          .setTitle("🎟️ SISTEMA DE TICKETS 🎟️")
          .setDescription(
            `${interaction.user}, o seu ticket foi criado em ${channel}. Confira o canal para prosseguirmos com o atendimento.`
          )
          .setColor("#7CFC00");

        interaction.reply({
          embeds: [ticketOpenEmbed],
          ephemeral: true,
        });

        userDepartments.set(member.id, selectedDept);

        const { embed: newEmbed, components } = createTicketEmbed();
        interaction.message.edit({
          embeds: [newEmbed],
          components,
        });
      })
      .catch((error) => {
        console.error("Error creating ticket:", error);
        interaction.reply("Houve um erro ao tentar criar o ticket.");
      });
  } else if (interaction.customId === "closeTicket") {
    const member = interaction.member;
    const ticketChannel = interaction.channel;
    const ticketChannelNameParts = ticketChannel.name.split("-");
    const selectedDept = ticketChannelNameParts[0];

    if (!selectedDept) {
      interaction.reply(
        "Não foi possível determinar o departamento do ticket."
      );
      return;
    }

    if (!ticketChannel.deletable) {
      interaction.reply(
        "O bot não tem permissão para excluir o canal do ticket."
      );
      return;
    }

    if (!ticketChannel.permissionsFor(member).has("MANAGE_CHANNELS")) {
      interaction.reply({
        content: "Você não tem permissão para fechar este ticket.",
        ephemeral: true,
      });
      return;
    }

    interaction.reply({ content: "Salvando as mensagens..." });

    ticketChannel.messages
      .fetch()
      .then(async (messages) => {
        let transcript = messages
          .filter((m) => !m.author.bot)
          .map((m) => {
            const timestamp = new Date(m.createdTimestamp).toLocaleString(
              "pt-BR"
            );
            const author = `${m.author.username}#${m.author.discriminator}`;
            const content =
              m.attachments.size > 0
                ? m.attachments.first().proxyURL
                : m.content;
            return `${timestamp} - ${author}: ${content}`;
          })
          .reverse()
          .join("\n");

        if (transcript.length < 1) {
          transcript = "Nada foi escrito neste ticket.";
        }

        hastebin
          .createPaste(
            transcript,
            { contentType: "text/plain", server: "https://hastebin.skyra.pw" },
            {}
          )
          .then(function (urlTranscript) {
            const embedLog = new MessageEmbed()
              .setDescription(
                `**INFORMAÇÕES DO TICKET**\n` +
                  ` \`Ticket fechado por:\` <@!${interaction.user.id}>\n` +
                  ` \`Canal deletado:\` ${ticketChannel.name}\n` +
                  ` \`ID:\` ${ticketChannel.id}\n` +
                  ` \`Transcript:\` [Clique](${urlTranscript})\n`
              )
              .setColor("#2f3136")
              .setTimestamp();

            const embedDM = new MessageEmbed()
              .setDescription(
                `Ficamos felizes em poder atendê-lo, esperamos que você tenha sido bem atendido.\n\n` +
                  `**INFORMAÇÕES DO TICKET**\n` +
                  ` \`Ticket fechado por:\` <@!${interaction.user.id}>\n` +
                  ` \`ID:\` ${ticketChannel.id}\n`
              )
              .setColor("#2f3136")
              .setTimestamp();

            const client = interaction.client;

            client.channels.cache
              .get(process.env.LOGCHANNELID)
              .send({ embeds: [embedLog] });

            ticketChannel.send("Excluindo o canal...");

            setTimeout(() => {
              ticketChannel.delete();
            }, 5000);

            userDepartments.delete(member.id);
          });
      })
      .catch((error) => {
        console.error("Erro ao buscar as mensagens do ticket:", error);
      });
  }
}

module.exports = {
  handleTicketInteraction,
};
