module.exports = {
  data: {
    name: "ping",
    description: "Ping!",
  },
  async execute(interaction) {
    if (interaction.replied) return;

    await interaction.deferReply();

    const sentMessage = await interaction.editReply("Calculating ping...");

    const latency = sentMessage.createdTimestamp - interaction.createdTimestamp;
    const gatewayPing = Math.round(interaction.client.ws.ping);

    sentMessage.edit(
      `Pong! Latency: ${latency}ms, Gateway Ping: ${gatewayPing}ms`
    );
  },
};
