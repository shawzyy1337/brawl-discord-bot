const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

const ticketOptions = [
  { label: "Departamento 1", value: "dept1" },
  { label: "Departamento 2", value: "dept2" },
  { label: "Departamento 3", value: "dept3" },
];

function createTicketEmbed() {
  const embed = new MessageEmbed()
    .setTitle("TICKETS")
    .setDescription(
      "Nossa equipe está sempre em atividade para tirar todas as suas dúvidas e atender seus chamados, para isso basta abrir um ticket, clicando no departamento que você quer.\n\n"
    )
    .addField(
      "Escolha um departamento:",
      "Selecione o departamento adequado no menu abaixo para abrir um ticket:"
    )
    .setColor("#00ff00");

  const selectMenu = new MessageSelectMenu()
    .setCustomId("ticketMenu")
    .addOptions(ticketOptions);

  const actionRow = new MessageActionRow().addComponents(selectMenu);

  return { embed, components: [actionRow] };
}

module.exports = {
  createTicketEmbed,
  ticketOptions,
};
