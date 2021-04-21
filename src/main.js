const { Octokit } = require('@octokit/rest');
const core = require("@actions/core");
const github = require('@actions/github');
const axios = require('axios');

const {
  filterChangelogs,
  getChangelog,
} = require('./util.js');

const { dealStringToArr } = require('actions-util');

// **********************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });

const dingdingToken = core.getInput('dingding-token');
const dingdingMsg = core.getInput('dingding-msg');
const dingdingIgnore = core.getInput('dingding-ignore');

const triger = core.getInput('triger', { required: true });
const branch = core.getInput('branch', { required: true });
const changelogs = core.getInput('changelogs', { required: true });

const draft = core.getInput('draft') || false;
const prerelease = core.getInput('prerelease') || false;

// **********************************************************
async function main() {
  const { owner, repo } = github.context.repo;
  core.info(`owner: ${owner}, repo: ${repo}`);
  const { ref_type: refType, ref: version } = github.context.payload;
  core.info(`ref_type: ${refType}, ref: ${version}`);

  if (refType !== triger) {
    core.info("The input 'triger' not match acionts 'on'");
    return false;
  }

  let real = [];
  let arr = [];
  const changelogArr = dealStringToArr(changelogs);
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  for (let i = 0; i < changelogArr.length; i += 1) {
    let content = await axios.get(`${url}/${changelogArr[i]}`);
    let changelog = '' || getChangelog(content.data, version);
    arr.push(changelog);
    real.push(changelog);
    if (changelog && i !== changelogArr.length - 1) {
      arr.push('---');
    }
  }
  let show = arr.join('\n');

  await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: version,
    name: version,
    body: show,
    draft,
    prerelease,
  });
  core.info(`Success release ${version}`);

  if (dingdingToken && dingdingMsg) {
    if (dingdingIgnore) {
      const ignores = dealStringToArr(dingdingIgnore);
      ignores.forEach(ig => {
        if (version.includes(ig)) {
          core.info(`[Version: ${version}] include ${ig}! Do ignore!`);
          return false;
        }
      })
    }

    const log = filterChangelogs(changelogArr, dingdingMsg, real);
    axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
      msgtype: 'markdown',
      markdown: {
        title: `${version} 发布日志`,
        text: `# ${version} 发布日志 \n\n ${log}`,
      },
    });
    core.info(`Success post dingding ${version}`);
  }
};

main();
