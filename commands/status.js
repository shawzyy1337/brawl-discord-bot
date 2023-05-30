const { MessageEmbed } = require("discord.js");

module.exports = {
  data: {
    name: "status",
    description: "Status!",
  },
  async execute(interaction) {
    if (interaction.replied) return;

    const serverIP = "redebrawl.com";
    const lojaURL = "https://loja.redebrawl.com";
    const serverStatus = "ON";
    const playersOnline = "10/20";
    const motd = "Bem-vindo ao servidor RedeBrawl!";

    const embed = new MessageEmbed()
      .setTitle("Status do Servidor de Minecraft")
      .addField("IP", serverIP)
      .addField("Loja", `[Clique aqui](${lojaURL})`)
      .addField("Status", serverStatus)
      .addField("Jogadores Online", playersOnline)
      .addField("MOTD", motd);

    await interaction.reply({ embeds: [embed] });
  },
};
