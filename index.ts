import dotenv from 'dotenv';
import { Client, Intents, TextChannel } from 'discord.js';
import { checkFarms, checkPrices } from './src/index';
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

//discord api setup
client.login(process.env.DISCORD_TOKEN).then(
  async () => {
    if (!process.env.GUILD || !process.env.CHANNEL) throw Error('.env files missing guild or channel id.');

    //check channels
    const guild = client.guilds.cache.get(process.env.GUILD);
    if (!guild) {
      throw Error('Impossible to connect to guild: ' + process.env.GUILD);
    }
    const channel = await guild.channels.fetch(process.env.CHANNEL);
    if (!channel) {
      throw Error("Can't connect to this channel.");
    }
    const textChannel = await channel.fetch();
    if (!(textChannel instanceof TextChannel)) {
      throw Error('This channel is not a text channel.');
    }

    //add routines
    const users = process.env.USERS?.split(' ').map((user) => {
      return `<@${user}>`;
    });
    const silenceDuration = 43200_000; //12 hours in ms
    let lastFarmPing = 0;
    let lastPricePing = 0;
    setInterval(async () => {
      const farmState = await checkFarms();
      if (farmState.success === false && lastFarmPing + silenceDuration < Date.now()) {
        textChannel.send({ content: farmState.msg + '. ' + users?.join(' ') });
        lastFarmPing = Date.now();
      }
      const priceState = await checkPrices();
      if (priceState.success === false && lastPricePing + silenceDuration < Date.now()) {
        textChannel.send({ content: priceState.msg + '. ' + users?.join(' ') });
        lastPricePing = Date.now();
      }
    }, 300_000); //5 min

    //add commands
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'ping-price') {
        const { success, msg } = await checkPrices();
        await interaction.reply({ content: success ? 'API working as expected.' : msg });
      }
      if (commandName === 'ping-farm') {
        const { success, msg } = await checkFarms();
        await interaction.reply({ content: success ? 'API working as expected.' : msg });
      }
    });
  },
  (err) => {
    console.log(err);
    throw Error("Can't connect to discord api.");
  }
);
