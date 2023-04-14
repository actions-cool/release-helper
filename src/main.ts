import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { dealStringToArr } from 'actions-util';
import axios from 'axios';

import { execOutput, filterChangelogs, getChangelog, replaceMsg } from './util';

// **********************************************************
async function main(): Promise<void> {
  try {
    // **********************************************************
    const token = core.getInput('token');
    const octokit = new Octokit({ auth: `token ${token}` });

    const dingdingToken = core.getInput('dingding-token');
    const dingdingMsg = core.getInput('dingding-msg');
    const dingdingIgnore = core.getInput('dingding-ignore');

    const triger = core.getInput('triger');
    const trigger = core.getInput('trigger') || triger;
    let branch = core.getInput('branch');
    const branches = dealStringToArr(branch);
    const tag = core.getInput('tag');
    const tags = dealStringToArr(tag);
    const conchTag = core.getInput('conch-tag');
    const conchTags = dealStringToArr(conchTag);
    const changelogs = core.getInput('changelogs');

    const latest = core.getInput('latest');
    let makeLatest = 'true';

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

    if (refType !== trigger) {
      error("[Actions] The input 'triger' not match acionts 'on'");
      return;
    }
    let conch = 'conch';
    info(`tags: ${JSON.stringify(tags)}`);
    if (tags && tags.length) {
      for (let i = 0; i < tags.length; i++) {
        let t = tags[i];
        t = t.replace('*', '');
        if ((version + '').startsWith(t)) {
          branch = branches[i] || '';
          conch = conchTags[i] || 'conch';
          break;
        }
      }
    }
    info(`branch: ${branch}`);

    if (latest) {
      const l = latest.replace('*', '');
      if ((version + '').startsWith(l)) {
        makeLatest = 'true';
      } else {
        makeLatest = 'false';
      }
    }

    const real = [];
    const arr = [];
    const changelogArr = dealStringToArr(changelogs);

    let show = '';
    if (branch) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
      info(`url: ${url}`);
      for (let i = 0; i < changelogArr.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await axios.get(`${url}/${changelogArr[i]}`);
        const [changelog, changelogPre] = getChangelog(data, version, prettier !== '');
        arr.push(changelog);
        real.push(changelogPre);
        if (changelog && i !== changelogArr.length - 1) {
          arr.push('---');
        }
      }
      show = arr.join('\n');
    }

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

    const release = core.getInput('release');
    if (release !== 'false') {
      await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: version,
        name: version,
        body: show,
        draft: !!draft,
        prerelease: pre,
        make_latest: makeLatest as any,
      });
      info(`[Actions] Success release ${version}.`);
    } else {
      info(`[Actions] Skip release ${version}.`);
    }

    let ddNotice = !pre;
    if (prereleaseNotice && pre) {
      ddNotice = true;
    }

    if (dingdingToken && ddNotice) {
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

      let log = '';
      if (dingdingMsg) {
        log = filterChangelogs(changelogArr, dingdingMsg, real);
      }
      let msgTitle = core.getInput('msg-title');
      const msgHead = core.getInput('msg-head');
      const msgPoster = core.getInput('msg-poster');
      const msgFooter = core.getInput('msg-footer');

      const replaceMsg4Me = (msg: string) => {
        return replaceMsg(msg, version, owner, repo);
      };

      if (msgTitle) {
        msgTitle = replaceMsg4Me(msgTitle);
      } else {
        msgTitle = `# ${version} 发布日志`;
      }

      if (msgHead) {
        log = `${replaceMsg4Me(msgHead)}\n\n${log}`;
      }

      if (msgPoster) {
        log = `![](${msgPoster})\n\n${log}`;
      }

      if (msgFooter) {
        log += `\n\n${replaceMsg4Me(msgFooter)}`;
      }

      const time = core.getInput('dingding-delay-minute') || 0;
      info(`[Actions] [time] ${time} start: ${Date.now()}`);

      setTimeout(async () => {
        info(`[Actions] [time] ${time} go: ${Date.now()}`);
        const antdMsg = core.getInput('antd-conch-msg');
        if (antdMsg) {
          const result = await execOutput(`npm view antd dist-tags --json`);
          const distTags = JSON.parse(result);
          const conchTagTemp = distTags[conch];
          if (conchTagTemp) {
            log += `\n\n ${antdMsg}${conchTagTemp}`;
          }
        }
        const dingdingTokenArr = dingdingToken.split(' ');
        /* eslint-disable no-await-in-loop, no-restricted-syntax */
        for (const dingdingTokenKey of dingdingTokenArr) {
          if (dingdingTokenKey) {
            await axios.post(
              `https://oapi.dingtalk.com/robot/send?access_token=${dingdingTokenKey}`,
              {
                msgtype: 'markdown',
                markdown: {
                  title: `${version} 发布日志`,
                  text: `${msgTitle} \n\n ${log}`,
                },
              },
            );
          }
        }

        info(`[Actions] Success post dingding message of ${version}`);
      }, +time * 1000 * 60);
    }
  } catch (e: any) {
    core.error(`[Actions] Error: ${e.message}`);
  }
}

main();
