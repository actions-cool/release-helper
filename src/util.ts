import { exec } from '@actions/exec';

export const getChangelog = (content: string, version: string, prettier: boolean): string[] => {
  const lines = content.split('\n');
  const changeLog = [];
  const changeLogPre = [];
  const startPattern = new RegExp(`^## ${version}`);
  const stopPattern = /^## /; // 前一个版本
  const skipPattern = /^`/; // 日期
  let begin = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (begin && stopPattern.test(line)) {
      break;
    }
    if (begin && line && !skipPattern.test(line)) {
      let l = line;
      if (prettier) {
        if (line.startsWith('-')) l = `${line.replace('-', '◆')}\n`;
        if (line.startsWith('  -')) l = `${line.replace('  -', '\xa0\xa0\xa0\xa0◇')}\n`;
        l = `${l}\n`;
        l = l.replace(/`/g, '');
      }
      changeLogPre.push(l);
      changeLog.push(line);
    }
    if (!begin) {
      begin = startPattern.test(line);
    }
  }
  return [changeLog.join('\n'), changeLogPre.join('\n')];
};

export const filterChangelogs = (changelogArr: string[], filter: string, arr: string[]): string => {
  let result = '';
  changelogArr.forEach((item, index) => {
    if (item === filter) {
      result = arr[index];
    }
  });
  return result;
};

export const replaceMsg = (msg: string, version: string, owner: string, repo: string) => {
  return msg
    .replace('{{v}}', version)
    .replace('{{url}}', `https://github.com/${owner}/${repo}/releases/tag/${version}`);
};

export const execOutput = async (command: string) => {
  let myOutput: string = '';
  const options = {
    listeners: {
      stdout: (stdoutData: Buffer) => {
        myOutput += stdoutData.toString();
      },
    },
  };
  await exec(command, [], options);
  return myOutput;
};
