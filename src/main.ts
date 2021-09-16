import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { dealStringToArr } from 'actions-util';
import axios from 'axios';

import { filterChangelogs, getChangelog } from './util';

// **********************************************************
async function main(): Promise<void> {
  try {
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
    const prereleaseFilter = core.getInput('prerelease-filter');
    const prereleaseNotice = core.getInput('prerelease-notice') || false;

    const prettier = core.getInput('prettier');

    const { owner, repo } = github.context.repo;
    const { info, error } = core;

    info(`owner: ${owner}, repo: ${repo}`);
    const { ref_type: refType, ref: version } = github.context.payload;
    info(`ref_type: ${refType}, ref: ${version}`);

    if (refType !== triger) {
      error("[Actions] The input 'triger' not match acionts 'on'");
      return;
    }

    const real = [];
    const arr = [];
    const changelogArr = dealStringToArr(changelogs);
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

    for (let i = 0; i < changelogArr.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await axios.get(`${url}/${changelogArr[i]}`);
      const [changelog, changelogPre] = getChangelog(data, version, prettier === 'true');
      arr.push(changelog);
      real.push(changelogPre);
      if (changelog && i !== changelogArr.length - 1) {
        arr.push('---');
      }
    }
    const show = arr.join('\n');

    let pre = Boolean(prerelease);
    if (prereleaseFilter) {
      const filters = dealStringToArr(prereleaseFilter);
      // eslint-disable-next-line no-restricted-syntax
      for (const fil of filters) {
        if (version.includes(fil)) {
          info(`[Actions] [Version: ${version}] include ${fil}! Go prerelease!`);
          pre = true;
          break;
        }
      }
    }

    await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: version,
      name: version,
      body: show,
      draft: !!draft,
      prerelease: pre,
    });
    info(`[Actions] Success release ${version}.`);

    const ddNotice = prereleaseNotice === 'true' || !pre;

    if (dingdingToken && dingdingMsg && ddNotice) {
      if (dingdingIgnore) {
        const ignores = dealStringToArr(dingdingIgnore);
        // eslint-disable-next-line no-restricted-syntax
        for (const ig of ignores) {
          if (version.includes(ig)) {
            info(`[Actions] [Version: ${version}] include ${ig}! Do ignore!`);
            return;
          }
        }
      }

      const log = filterChangelogs(changelogArr, dingdingMsg, real);
      axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
        msgtype: 'markdown',
        markdown: {
          title: `${version} 发布日志`,
          text: `# ${version} 发布日志 \n\n ${log}`,
        },
      });
      info(`[Actions] Success post dingding message of ${version}.`);
    }
  } catch (e: any) {
    core.error(`[Actions] Error: ${e.message}`);
  }
}

main();
