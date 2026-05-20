# 🌈 Release Helper

![](https://img.shields.io/github/workflow/status/actions-cool/release-helper/CI?style=flat-square)
[![](https://img.shields.io/badge/marketplace-release--helper-blueviolet?style=flat-square)](https://github.com/marketplace/actions/release-helper)
[![](https://img.shields.io/github/v/release/actions-cool/release-helper?style=flat-square&color=orange)](https://github.com/actions-cool/release-helper/releases)

🤖 A GitHub Action that help you publish release.

> Mainly used `antd`. Suggest [**changelog**](https://github.com/ant-design/ant-design/blob/master/CHANGELOG.en-US.md) use the same format.

## 🚀 Usage

**Special reminder:** Releases and tags are no longer being updated. Please use commits as a guide and check the changes in commits when updating.

**Like:** `uses: actions-cool/release-helper@dcd7c203f7021878abd237fb4c1e6dfd5e39f8d9`

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
        if: github.event.ref_type == 'tag'
        uses: actions-cool/release-helper@dcd7c203f7021878abd237fb4c1e6dfd5e39f8d9
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          trigger: 'tag'
          changelogs: 'CHANGELOG.en-US.md, CHANGELOG.zh-CN.md'
          branch: 'master'
```

### Inputs

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub Token | string | ✔ |
| trigger | Triggering conditions | string | ✔ |
| changelogs | The file path | string | ✔ |
| branch | The file branch | string | ✔ |
| tag | Tag for branch. Check startsWith | string | ✖ |
| release | Whether release. Default `true` | boolean | ✖ |
| draft | Whether create a draft (unpublished) release. Default `false` | boolean | ✖ |
| prerelease | Whether to identify the release as a prerelease. Default `false` | boolean | ✖ |
| prerelease-filter | Version filter prerelease| string | ✖ |
| prerelease-notice | prerelease 是否发布钉钉通知，默认为 false | boolean | ✖ |
| dingding-token | 发布钉钉通知使用 | string | ✖ |
| dingding-msg | 发布钉钉内容，从 changelogs 中选一个 | string | ✖ |
| dingding-delay-minute | 发布钉钉内容延迟，单位分钟 | string | ✖ |
| msg-title | 钉钉内容标题自定义 | string | ✖ |
| msg-poster | 钉钉内容海报，传入图片 url | string | ✖ |
| msg-head | 钉钉内容主题前置自定义 | string | ✖ |
| msg-footer | 钉钉内容主题后置自定义 | string | ✖ |
| prettier | 钉钉内容美化 | boolean | ✖ |
| dingding-ignore | DingTalk ignore when version contain | string | ✖ |

- [钉钉群自定义机器人接入](https://developers.dingtalk.com/document/robots/custom-robot-access)
- 由于钉钉对二级层级展示不好，这里可设置 prettier 开启人为美化
- msg 自定义支持 2 个替换
  - `{{v}}` -> 具体版本
  - `{{url}}` -> 发布链接
  - 例如：`msg-footer: '> footer: version is {{v}} url is [url]({{url}})'`
- 你可以设置多个 dingding-token
  - `dingding-token: ${{ secrets.TOKEN1 }} ${{ secrets.TOKEN2 }}`
- delay 切莫设置过大，我记得 CI 超过几个小时自动过期

### Workflow

- `git tag x.x.x`
- `git push origin x.x.x:x.x.x`
- New tag triger action
- Auto release with changelog

## ⚡ Feedback

You are very welcome to try it out and put forward your comments. You can use the following methods:

- Report bugs or consult with [Issue](https://github.com/actions-cool/release-helper/issues)
- Submit [Pull Request](https://github.com/actions-cool/release-helper/pulls) to improve the code of `release-helper`

## LICENSE

[MIT](./LICENSE)
