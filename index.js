const { Client, Intents, Collection } = require("discord.js");
const cliTable = require("cli-table3");
const ticketHandler = require("./tickets/ticketHandler");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const fs = require("fs");
require("dotenv").config();
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

client.on("ready", async () => {
  console.log("Bot is ready!");

  console.log("Loading commands...");
  await delay(3000);
  console.log("Commands loaded!");

  const commandsTable = new cliTable({
    head: ["Command Name", "Load Time"],
    colWidths: [30, 15],
  });

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
    await interaction.reply("There was an error executing that command.");
  }
});

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (channel) =>
      channel.type === "GUILD_TEXT" &&
      channel.name === process.env.welcomeChannelName
  );

  if (!channel) return;

  channel.send(`Bem-vindo, ${member.user}!`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!setupTickets") {
    const { embed, components } = ticketHandler.createTicketEmbed();

    message.reply({
      embeds: [embed],
      components: components,
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  if (interaction.customId === "ticketMenu") {
    const selectedDept = interaction.values[0];

    /* TODO:
        - Add the actual ticket logic
    */

    interaction.reply(`Você selecionou o departamento: ${selectedDept}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
