const { Client, Intents, Collection } = require("discord.js");
const cliTable = require("cli-table3");
const ticketHandler = require("./tickets/ticketHandler");
const ticketInteraction = require("./tickets/ticketInteraction");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

async function updateBotStatus() {
  try {
    const response = await axios.get(
      "https://api.mcsrvstat.us/2/redebrawl.com"
    );

    const playersOnline = response.data.players.online;
    client.user.setActivity(`${playersOnline} jogadores online`, {
      type: "WATCHING",
    });
  } catch (error) {
    console.error("Error while fetching API data:", error);
  }
}

client.on("ready", async () => {
  console.log("Bot is ready!");

  console.log("Loading commands...");

  const commandsTable = new cliTable({
    head: ["Command Name", "Load Time"],
    colWidths: [30, 15],
  });

  updateBotStatus();
  setInterval(updateBotStatus, 60000);

  const startTime = Date.now();

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (command.data) {
      const startCommandTime = Date.now();

      client.commands.set(command.data.name, command);
      await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.create(command.data);

      const commandLoadTime = Date.now() - startCommandTime;
      commandsTable.push([command.data.name, `${commandLoadTime}ms`]);
    }
  }

  const totalTime = Date.now() - startTime;
  console.log("Command load times:");
  console.log(commandsTable.toString());
  console.log(`Total load time: ${totalTime}ms`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    await command.execute(interaction, options);
  } catch (error) {
    console.error(error);
    await interaction.reply("Houve um erro ao executar o comando.");
  }
});

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (channel) =>
      channel.type === "GUILD_TEXT" &&
      channel.name === process.env.WELCOMECHANNELNAME
  );

  if (!channel) return;

  channel.send(`Bem-vindo, ${member.user}!`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!setupTickets") {
    const { embed, components } = ticketHandler.createTicketEmbed();

    message.channel.send({
      embeds: [embed],
      components: components,
    });
  }
});

client.on("interactionCreate", ticketInteraction.handleTicketInteraction);

client.login(process.env.DISCORD_TOKEN);
