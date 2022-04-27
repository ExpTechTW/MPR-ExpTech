'use strict'

const Plugin = {
    "name": "ExpTech",
    "version": "1.0.0",
    "depends": {
        "pluginLoader": ">=4.7.0",
        "DataBase": ">=1.1.0"
    },
    "Events": ["messageCreate", "ready"],
    "Commands": [
        {
            "name": "state here",
            "note": "狀態顯示"
        }
    ],
    "author": ["whes1015"],
    "link": "https://github.com/ExpTechTW/MPR-KeyWord",
    "resources": ["AGPL-3.0"],
    "description": "ExpTech 狀態顯示",
    "DHL": false
}

const DB = require("./DataBase")
const pluginLoader = require('../Core/pluginLoader')
const fetch = require('node-fetch')
let state = 0

async function ready(client) {
    load(client)
}

async function messageCreate(client, message) {
    if (message.content == "state here") {
        client.channels.cache.get(message.channel.id).send(await pluginLoader.embed("加載中..."))
        state = 1
    } else if (client.user.id == message.author.id && state == 1) {
        state = 0
        DB.write(Plugin, "channelID", message.channel.id)
        DB.write(Plugin, "messageID", message.id)
        load(client)
    }
}

async function load(client) {
    if (await DB.read(Plugin, "channelID") != false && await DB.read(Plugin, "channelID") != null) {
        let channels = await client.channels.cache.get(await DB.read(Plugin, "channelID"))
        let MSG = await channels.messages.fetch(await DB.read(Plugin, "messageID"))
        setInterval(async () => {
            let res = await fetch("http://exptech.mywire.org/API/times.json")
            let Json = await res.json()
            let times = Math.round(Json["Minutes"][11]["times"] / 60)
            let msg = `**ExpTech API 負載狀態**\n\n**近 5 分鐘 ${Json["Minutes"][11]["times"]}**\n`
            for (let index = 0; index < times; index++) {
                if (index == 10) break
                msg = msg + "🟥 "
            }
            for (let index = 0; index < 10 - times; index++) {
                msg = msg + "🟩 "
            }
            times = Math.round(Json["Hours"][23]["times"] / 720)
            msg = msg + `\n\n**近 1 小時 ${Json["Hours"][23]["times"]}**\n`
            for (let index = 0; index < times; index++) {
                if (index == 10) break
                msg = msg + "🟥 "
            }
            for (let index = 0; index < 10 - times; index++) {
                msg = msg + "🟩 "
            }
            MSG.edit(await pluginLoader.embed(msg))
        }, 60000)
    }
}

module.exports = {
    Plugin,
    ready,
    messageCreate
}
