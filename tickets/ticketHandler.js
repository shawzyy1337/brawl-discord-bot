const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

const ticketOptions = [
  { label: "❓  Dúvidas", value: "duvidas" },
  { label: "🛒 Compras", value: "compras" },
  { label: "📜 Revisar Banimento", value: "revisao" },
  { label: "⚠️ Reportar um Bug", value: "bug" },
];

function createTicketEmbed() {
  const embed = new MessageEmbed()
    .setTitle("🎟️ SISTEMA DE TICKETS 🎟️")
    .setDescription(
      "**»** Apresentamos o nosso sistema de tickets, uma plataforma segura e confidencial projetada para lidar com problemas sérios\n\n**»** Use este sistema com responsabilidade e apenas para problemas genuínos que exijam intervenção da equipe. O uso indevido do sistema pode resultar em ``punições ou perda de acesso ao sistema de tickets.``\n\n **Escolha um Departamento:** \n Selecione o departamento adequado no menu abaixo para abrir um ticket:"
    )
    .setColor("#2f3136");

  const selectMenu = new MessageSelectMenu()
    .setCustomId("ticketMenu")
    .setPlaceholder("Selecione o atendimento!");

  ticketOptions.forEach((option) => {
    selectMenu.addOptions(option);
  });

  const actionRow = new MessageActionRow().addComponents(selectMenu);

  return {
    embed,
    components: [actionRow],
  };
}

module.exports = {
  createTicketEmbed,
  ticketOptions,
};
