export const DefaultPrettier = ['◆', '◇'];

export const getChangelog = (content: string, version: string, prettier: string[]): string[] => {
  const lines = content.split('\n');
  const changeLog = [];
  const changeLogPre = [];
  const startPattern = new RegExp(`^## ${version}`);
  const stopPattern = /^## /; // 前一个版本
  const skipPattern = /^`/; // 日期
  let begin = false;

  const len = prettier.length;
  let r1: string;
  let r2: string;

  if (len === 1 && prettier[0] === 'true') {
    [r1, r2] = DefaultPrettier;
  } else if (len === 1) {
    // eslint-disable-next-line prefer-destructuring
    r1 = prettier[0];
    // eslint-disable-next-line prefer-destructuring
    r2 = prettier[0];
  } else {
    [r1, r2] = prettier;
  }

  // Add default gap
  r2 = `\xa0\xa0\xa0\xa0${r2}`;


  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (begin && stopPattern.test(line)) {
      break;
    }

    if (begin && line && !skipPattern.test(line)) {
      let l = line;

      if (len && prettier[0] !== 'false') {
        if (line.startsWith('-')) l = `${line.replace('-', r1)}\n`;
        if (line.startsWith('  -')) l = `${line.replace('  -', r2)}\n`;
        l = `${line}\n`;
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
