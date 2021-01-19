# 🌈 Release Helper

🤖 A GitHub Action that help you publish release.

> Mainly used `antd`. Suggest [**changelog**](https://github.com/ant-design/ant-design/blob/master/CHANGELOG.en-US.md) use the same format.

## 🎁 Usage

### Inputs

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub Token | string | ✔ |
| triger | Triggering conditions | string | ✔ |
| changelogs | The file path | string | ✔ |
| branch | The file branch | string | ✔ |
| draft | Whether create a draft (unpublished) release. Default `false` | boolean | ✖ |
| prerelease | Whether to identify the release as a prerelease. Default `false` | boolean | ✖ |
| dingding-token | 发布钉钉通知使用 | string | ✖ |
| dingding-msg | 发布钉钉内容，从 changelogs 中选一个 | string | ✖ |

### Example

```yml
name: 🤖 Auto Make Release

on:
  create

jobs:
  release-helper:
    runs-on: ubuntu-latest
    steps:
      - name: make release
        uses: actions-cool/release-helper@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          triger: 'tag'
          changelogs: 'CHANGELOG.en-US.md, CHANGELOG.zh-CN.md'
          branch: 'master'
```

## 💖 Who is using?


## ⚡ Feedback

You are very welcome to try it out and put forward your comments. You can use the following methods:

- Report bugs or consult with [Issue](https://github.com/actions-cool/release-helper/issues)
- Submit [Pull Request](https://github.com/actions-cool/release-helper/pulls) to improve the code of `release-helper`

## LICENSE

[MIT](https://github.com/actions-cool/release-helper/blob/main/LICENSE)
