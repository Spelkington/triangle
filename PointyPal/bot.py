# bot.py

import os
import sys
import discord
from dotenv import load_dotenv

try:
    load_dotenv()
    TOKEN = os.getenv('DISCORD_TOKEN')
    GUILD = os.getenv('DISCORD_GUILD')
    assert not TOKEN is None
    assert not GUILD is None
except AssertionError as e:
    print("The .env failed to load the required variables. Are you sure that the .env has been created?")
    sys.exit(-1)

client = discord.Client()

@client.event
async def on_ready():

    guild = discord.utils.get(client.guilds, name=GUILD)

    print(
        f'{client.user} has connected to Discord! \n'
        f'{client.user} is currently in the guild: {guild.name} (id: {guild.id})'
    )


client.run(TOKEN)