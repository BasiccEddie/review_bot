// ===========================
// Reviews Bot — index.js
// ===========================

// 1️⃣ Import required packages
const fs = require('fs');
const path = require('path'); // <-- make sure path is imported
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// 2️⃣ Environment variables from Railway
const token = process.env.TOKEN;
const mongoURI = process.env.MONGO_URI;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// 3️⃣ Debug Mongo URI (optional)
console.log('mongoURI:', mongoURI);

// 4️⃣ Connect to MongoDB (Mongoose v7+)
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// 5️⃣ Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 6️⃣ Command collection
client.commands = new Collection();

// 7️⃣ Load commands from /commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARN] Command ${file} is missing data or execute property.`);
    }
}

// 8️⃣ Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ There was an error executing this command!', ephemeral: true });
    }
});

// 9️⃣ Bot ready
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

// 1️⃣0️⃣ Login
client.login(token);
