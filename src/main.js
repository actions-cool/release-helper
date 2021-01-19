const { Octokit } = require('@octokit/rest');
const github = require('@actions/github');
const axios = require('axios');

const {
  dealStringToArr,
  filterChangelogs,
  getChangelog,
} = require('./util.js');

// **********************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });

const dingdingToken = core.getInput('dingding-token');
const dingdingMsg= core.getInput('dingding-msg');

const triger = core.getInput('triger', { required: true });
const branches = core.getInput('branches', { required: true });
const changelogs = core.getInput('changelogs', { required: true });

const draft = core.getInput('draft') || false;
const prerelease = core.getInput('prerelease') || false;

// **********************************************************
async function main() {
  const { owner, repo } = github.context.repo;
  const { ref_type: refType, ref: version } = github.context.payload;
  core.info(`ref_type: ${refType}, ref: ${version}`);

  if (refType !== triger) {
    core.setFailed("The input 'triger' not match acionts 'on'");
    return false;
  }

  let real = [];
  let arr = [];
  const branchArr = dealStringToArr(branches);
  const changelogArr = dealStringToArr(changelogs);

  for (let i = 0; i < branchArr.length; i += 1) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branchArr[i]}/`;
    changelogArr.forEach(async (item,index) => {
      let content = await axios.get(`${url}/${item}`);
      let changelog = '' || getChangelog(content.data, version);
      arr.push(changelog);
      real.push(changelog);
      if (changelog && index !== changelogArr.length - 1) {
        arr.push('---');
      }
    });

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
    core.setOutput("check-result", !!checkResult);
  }
}

main();
