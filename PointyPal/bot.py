# bot.py

import os
import sys
import discord
from dotenv import load_dotenv
import asyncio

WELCOME_TEXT = open("welcome.md").read()

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
guild = None

@client.event
async def on_ready():

    guild = discord.utils.get(client.guilds, name=GUILD)

    print(
        f'{client.user} has connected to Discord! \n'
        f'{client.user} is currently in the guild: {guild.name} (id: {guild.id})'
    )

@client.event
async def on_member_join(member):

    print(f'{member.name} has joined the server! Assigning them the "unverified" status...')

    guild = discord.utils.get(client.guilds, name=GUILD)
    role = discord.utils.get(guild.roles, name="Unverified")

    print(f'Targeted role: {role.name}')

    await member.add_roles(role)

    channel = discord.utils.get(guild.channels, name="verification")

    print(f'Printing welcome message to #{channel.name} (id: {channel.id})')

    welcome_scroll = open("welcome.md").read()
    

    await asyncio.sleep(3)
    await channel.send(welcome_scroll % (
                member.mention,
                discord.utils.get(guild.channels, name="rules").mention,
                discord.utils.get(guild.members, name="Spelkington").mention,
                discord.utils.get(guild.roles, name="Mods").mention,
            ))

client.run(TOKEN)
