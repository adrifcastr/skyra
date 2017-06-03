const constants = require("../../utils/constants");
const streamToArray = require("stream-to-array");
const { readFile } = require("fs-nextra");
const GIFEncoder = require("gifencoder");
const Canvas = require("canvas");
const { sep } = require("path");

const triggering = async (client, user) => {
  const imgTitle = new Canvas.Image();
  const imgTriggered = new Canvas.Image();
  const encoder = new GIFEncoder(350, 393);
  const c = new Canvas(350, 393);
  const ctx = c.getContext("2d");

  const [userBuffer, titleBuffer] = await Promise.all([
    client.wrappers.fetchAvatar(user, 512),
    readFile(`${constants.assets}images${sep}memes${sep}triggered.png`),
  ]);
  imgTitle.src = titleBuffer;
  imgTriggered.src = userBuffer;

  const stream = encoder.createReadStream();
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(50);
  encoder.setQuality(200);

  const coord1 = [-25, -50, -42, -14];
  const coord2 = [-25, -13, -34, -10];

  for (let i = 0; i < 4; i++) {
    ctx.drawImage(imgTriggered, coord1[i], coord2[i], 400, 400);
    ctx.fillStyle = "rgba(255 , 100, 0, 0.4)";
    ctx.drawImage(imgTitle, 0, 340, 350, 53);
    ctx.fillRect(0, 0, 350, 350);
    encoder.addFrame(ctx);
  }

  // FINISH
  encoder.finish();

  return streamToArray(stream).then(Buffer.concat);
};

exports.run = async (client, msg, [search = msg.member]) => {
  const user = await client.funcs.search.User(search, msg.guild);
  const cv = await triggering(client, user);
  await msg.channel.sendFile(cv, "triggered.gif");
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "triggered",
  description: "Get triggered.",
  usage: "[user:string]",
  usageDelim: "",
  extendedHelp: [
    "What? My commands aren't enough userfriendly? (╯°□°）╯︵ ┻━┻",
    "",
    "Usage:",
    "&triggered [user]",
    "",
    " ❯ User: the user you want to be triggered. If not defined, it'll take your avatar instead.",
  ].join("\n"),
};
