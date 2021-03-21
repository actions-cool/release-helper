function getChangelog(content, version) {
  const lines = content.split('\n');
  const changeLog = [];
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
      changeLog.push(line);
    }
    if (!begin) {
      begin = startPattern.test(line);
    }
  }
  return changeLog.join('\n');
};

function filterChangelogs(changelogArr, filter, arr) {
  let result = '';
  changelogArr.forEach((item,index) => {
    if (item === filter) {
      result = arr[index];
    }
  });
  return result;
};

module.exports = {
  filterChangelogs,
  getChangelog,
};
