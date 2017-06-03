const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const constants = require("../../utils/constants");

/* Autentification */
const { osu } = constants.getConfig.tokens;

const game = {
  STANDARD: 0,
  TAIKO: 1,
  CTB: 2,
  MANIA: 3,
};

const inf = {
  SIGNATURES: 1,
  USERPROFILE: 2,
  BESTPLAYS: 3,
  RECENTPLAYS: 4,
};

exports.run = async (client, msg, [gamemode, information, ...username]) => {
  gamemode = game[gamemode.toUpperCase()];
  information = inf[information.toUpperCase()];
  username = username[0].split(" ").join("+");

  await msg.send("`Fetching data...`");
  const { data } = await fetchJSON(`https://osu.ppy.sh/api/get_user?m=${gamemode}&u=${encodeURIComponent(username)}&k=${osu}`);
  const uinfo = data[0];
  if (!uinfo) throw new Error(constants.httpResponses(404));
  const embed = new client.methods.Embed().setColor(msg.color);
  switch (information) {
    case 1:
      embed.setTitle(`Osu! User profile for ${uinfo.username} (${uinfo.user_id})`)
        .setDescription(client.funcs.strip.indents`
          [**${uinfo.country}**] Level **${parseInt(uinfo.level)}**
          Rank: **${client.funcs.addCommas(uinfo.pp_rank)}** (Country rank: **${client.funcs.addCommas(uinfo.pp_country_rank)}**)
          \u200B
        `)
        .addField("❯ Information", client.funcs.strip.indents`
          \u200B  • Accuracy: **${parseInt(uinfo.accuracy)}**%
          \u200B  • Play count: **${client.funcs.addCommas(uinfo.playcount)}**
        `);
      break;
    case 2:
      embed.setTitle(`Osu! User profile for ${uinfo.username} (${uinfo.user_id})`)
        .setDescription(client.funcs.strip.indents`
          [**${uinfo.country}**] Level **${parseInt(uinfo.level)}**
          Rank: **${client.funcs.addCommas(uinfo.pp_rank)}** (Country rank: **${client.funcs.addCommas(uinfo.pp_country_rank)}**)
          \u200B
        `)
        .addField("❯ Scores", client.funcs.strip.indents`
          \u200B  • Total score: **${client.funcs.addCommas(uinfo.total_score)}**
          \u200B  • Ranked score: **${client.funcs.addCommas(uinfo.ranked_score)}**
        `, true)
        .addField("❯ Beatmaps", client.funcs.strip.indents`
          \u200B  • Play count: **${client.funcs.addCommas(uinfo.playcount)}**
          \u200B  • 50s: **${client.funcs.addCommas(uinfo.count50)}**
          \u200B  • 100s: **${client.funcs.addCommas(uinfo.count100)}**
          \u200B  • 300s: **${client.funcs.addCommas(uinfo.count300)}**
        `, true)
        .addField("❯ Accuracy ranks", client.funcs.strip.indents`
          \u200B  • Accuracy: **${parseInt(uinfo.accuracy)}**%
          \u200B  • Perfect accuracy: **${client.funcs.addCommas(uinfo.count_rank_ss)}**
          \u200B  • Nearly perfect accuracy: **${client.funcs.addCommas(uinfo.count_rank_s)}**
          \u200B  • Almost perfect accuracy: **${client.funcs.addCommas(uinfo.count_rank_a)}**
        `);
      break;
    case 3:
      embed.setTitle(`Best beatmap by ${uinfo.username} (${uinfo.user_id})`)
        .setDescription(`ID Beatmap: [**${uinfo.beatmap_id}**] Score: **${client.funcs.addCommas(uinfo.score)}**\n\u200B`)
        .addField("❯ Counts", client.funcs.strip.indents`
          \u200B  • 50s: **${client.funcs.addCommas(uinfo.count50)}**
          \u200B  • 100s: **${client.funcs.addCommas(uinfo.count100)}**
          \u200B  • 300s: **${client.funcs.addCommas(uinfo.count300)}**
          \u200B
          \u200B  • **${client.funcs.addCommas(uinfo.countmiss)}** misses.
          \u200B  • **${client.funcs.addCommas(uinfo.countkatu)}** katus.
          \u200B  • **${client.funcs.addCommas(uinfo.countgeki)}** gekis.
          \u200B  • **${uinfo.perfect ? "Maximum combo of map reached." : "Couldn't reach maximum combo of map."}**
          \u200B
        `, true)
        .addField("❯ Info", client.funcs.strip.indents`
          \u200B  • Date: **${uinfo.date}**
          \u200B  • Rank: **${client.funcs.addCommas(uinfo.rank)}**
        `);
      break;
    case 4:
      embed.setTitle(`Best beatmap by ${uinfo.username} (${uinfo.user_id})`)
        .setDescription(`ID Beatmap: [**${uinfo.beatmap_id}**] Score: **${client.funcs.addCommas(uinfo.score)}**\n\u200B`)
        .addField("❯ Counts", client.funcs.strip.indents`
          \u200B  • 50s: **${client.funcs.addCommas(uinfo.count50)}**
          \u200B  • 100s: **${client.funcs.addCommas(uinfo.count100)}**
          \u200B  • 300s: **${client.funcs.addCommas(uinfo.count300)}**
          \u200B
          \u200B  • **${client.funcs.addCommas(uinfo.countmiss)}** misses.
          \u200B  • **${client.funcs.addCommas(uinfo.countkatu)}** katus.
          \u200B  • **${client.funcs.addCommas(uinfo.countgeki)}** gekis.
          \u200B  • **${uinfo.perfect ? "Maximum combo of map reached." : "Couldn't reach maximum combo of map."}**
          \u200B
        `, true)
        .addField("❯ Info", client.funcs.strip.indents`
          \u200B  • Date: **${uinfo.date}**
          \u200B  • Rank: **${client.funcs.addCommas(uinfo.rank)}**
        `);
      break;
    // no default
  }
  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "osu",
  description: "Check info from Osu!",
  usage: "<Standard|Taiko|CtB|Mania> <Signatures|UserProfile|BestPlays|RecentPlays> <Username:str> [...]",
  usageDelim: " ",
  extendedHelp: [
    "Let's click hard! Do you want to check your stats on Osu?",
    "",
    "Usage:",
    "&osu <GameMode> <Information> <Username>",
    "",
    " ❯ GameMode: choose the gamemode you want to display info about.",
    " ❯ Information: choose the type of information.",
    " ❯ Username: your username!",
    "",
    "Examples:",
    "&osu standard userprofile kyra",
    "❯❯ I show you a lot of stuff from your account.",
  ].join("\n"),
};
