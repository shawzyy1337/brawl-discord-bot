const { Permissions, MessageEmbed } = require("discord.js");

function handleTicketInteraction(interaction) {
  if (!interaction.isSelectMenu()) return;

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
      .create(`ticket-${selectedDept}-${member.user.username}`, {
        type: "text",
        parent: categoryID,
        permissionOverwrites: overwrites,
      })
      .then((channel) => {
        const embed = new MessageEmbed()
          .setTitle("Suporte solicitado")
          .setDescription(welcomeMessage)
          .addField("Aberto por", member.user.tag)
          .addField("Quem poderá ajudar", `<@&${roleID}>`)
          .setColor("#00ff00");

        channel.send({ embeds: [embed] });
        interaction.reply(`Ticket aberto em ${channel}`);
      })
      .catch((error) => {
        console.error("Error creating ticket:", error);
        interaction.reply("Houve um erro ao tentar criar o ticket.");
      });
  }
}

module.exports = {
  handleTicketInteraction,
};
