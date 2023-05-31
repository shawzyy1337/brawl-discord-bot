const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: {
    name: "status",
    description: "Exibe o status do servidor de Minecraft Brawl.",
  },
  async execute(interaction) {
    if (interaction.replied) return;

    try {
      const response = await axios.get(
        "https://api.mcsrvstat.us/2/redebrawl.com"
      );

      const serverIP =
        "[redebrawl.com](https://pt.namemc.com/server/redebrawl.com)";
      const lojaURL = "https://loja.redebrawl.com";
      const serverStatus = response.data.online ? "`ONLINE`" : "`OFFLINE`";
      const playersOnline =
        "`" +
        `${response.data.players.online}/${response.data.players.max}` +
        "`";
      const motd = "```" + response.data.motd.clean.join("\n") + "```";

      const embed = new MessageEmbed()
        .setTitle("Status do Servidor de Minecraft")
        .addField("IP", serverIP, true)
        .addField("\u200B", "\u200B", true)
        .addField("Loja", `[loja.redebrawl.com](${lojaURL})`, true)
        .addField("Status", serverStatus, true)
        .addField("\u200B", "\u200B", true)
        .addField("Jogadores Online", playersOnline, true)
        .addField("MOTD", motd);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao obter os dados da API:", error);
      await interaction.reply("Ocorreu um erro ao obter os dados do servidor.");
    }
  },
};
