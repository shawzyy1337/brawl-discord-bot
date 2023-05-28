const { Client, Intents, Collection } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const fs = require("fs");
require("dotenv").config();
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (command.data) {
    client.commands.set(command.data.name, command);
  }
}

client.on("ready", async () => {
  console.log("Bot is ready!");

  console.log("Loading commands...");
  await delay(3000);
  console.log("Commands loaded!");

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (command.data) {
      client.commands.set(command.data.name, command);
      await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.create(command.data);
    }
  }
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

client.login(process.env.DISCORD_TOKEN);
