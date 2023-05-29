const {
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
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
      {
        id: guild.roles.everyone,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      {
        id: roleID,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      {
        id: member.id,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      },
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

    ticketChannel
      .delete()
      .then(() => {
        interaction.reply("Ticket fechado com sucesso.");
        userDepartments.delete(member.id);
      })
      .catch((error) => {
        console.error("Error closing ticket:", error);
        interaction.reply("Houve um erro ao tentar fechar o ticket.");
      });
  }
}

module.exports = {
  handleTicketInteraction,
};
