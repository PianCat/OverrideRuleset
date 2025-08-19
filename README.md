# PianCat's 的覆写规则仓库
此处存放我用于 Mihomo Party/FlClash/Stash/Substore 的覆写规则

基于 [powerfullz 的覆写规则仓库](https://github.com/powerfullz/override-rules) 修改而来

本仓库修改内容：
1. 去除基于yaml的覆写
2. 默认给了三种Arguments参数，方便FlClash等直接导入
3. 去除低倍率节点组（我用不上）
4. 去除一大堆奇奇怪怪的国家，只保留五大国，其余的节点全部扫入其他节点中
5. 增加了一些私货，用拼贴大法整出了Eh的图标
6. 重排序规则组，并删除一些我用不到的规则组，你要用你自己加，或者用回原版，谢谢理解
7. 为 Stash 做了额外适配，使用暴力覆写模式替换规则组（It just work，且不含Landing相关代理）
8. 搜狗默认不上传

**原仓库说明**

> 此处存放我用于 Mihomo/Substore 的覆写规则，以 [mihomo-party-org/override-hub](https://github.com/mihomo-party-org/override-hub) 内的 ACL4SSR 规则为灵感，几乎完全重新编写，具有以下优点：
> 
> - 集成 [SukkaW/Surge](https://github.com/SukkaW/Surge) 和 [Cats-Team/AdRules](https://github.com/Cats-Team/AdRules) 规则集，优化广告拦截、隐私保护及流量分流精度
> - 新增 Truth Social、E-Hentai、TikTok、加密货币等实用分流规则
> - 移除冗余规则集
> - 引入 [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat) 完整版 GeoSite/GeoIP 数据库
> - 针对 IP 规则添加 `no-resolve` 参数，避免本地 DNS 解析，提升上网速度，无 DNS 泄露
> - JS 格式覆写现已实现节点国家动态识别与分组，自动为实际存在的各国家/地区节点生成对应代理组，节点变动时分组自动变化，省心省力。例如：你的订阅没有韩国的节点，则最终生成的配置中「韩国节点」这个代理组就不会出现。
> 
> 谨此声明：本覆写规则为本人自用，现特此公开分享于公共平台。在未有回馈意见的情况下，自然优先满足个人需求及修正自己发现的问题。如有高见，欢迎 PR。

## 使用方法

### Mihomo Party

1. 复制对应文件的 raw 链接，例如：`https://github.com/PianCat/OverrideRuleset/raw/refs/heads/master/JavaScript/PianCat_Self_Convert_No_Arguments.js`。
2. 打开 Mihomo Party，左侧导航栏打开「覆写」页面，粘贴链接后导入，即可看到对应的覆写脚本/配置。
3. 左侧导航栏打开「订阅管理」，点击需要覆写的订阅右上角的三个点，选择「编辑信息」。
4. 在打开的对话框中最后一项「覆写」，选择刚刚导入的覆写脚本/配置，保存即可。

需要注意，Mihomo Party 在默认设置下还会接管 DNS 和 SNI（域名嗅探），需要手动在设置中关闭「控制 DNS 设置」和「控制域名嗅探」两个选项。

### Stash

1. 在 `覆写` 中，下载覆写文件 `https://github.com/PianCat/OverrideRuleset/raw/refs/heads/master/Stash/PianCat_Self_Convert_Stash_LoadBalance.stoverride`

### SubStore

参考[最速 Substore 订阅管理指南](https://blog.l3zc.com/2025/03/clash-subscription-convert/)。

2025/06/17更新：新增 JavaScript 格式覆写，支持传入参数，更易于维护，推荐使用。例如，有链式代理需求，使用如下覆写脚本链接即可：

```
https://raw.githubusercontent.com/PianCat/OverrideRuleset/refs/heads/master/JavaScript/PianCat_Self_Convert_with_Arguments.js#landing=true
```

传入多个参数时，用`&`分隔，例如`landing=true&loadbalance=true`。

目前支持的参数：

- `loadbalance`: 启用负载均衡 (默认false)
- `landing`: 启用落地节点功能 (默认false)
- `ipv6`: 启用 IPv6 支持 (默认false)
- `full`：生成完整配置（默认false，用于纯内核启动）
- `keepalive`: 启用 TCP Keep Alive（默认 false）[^fn2]

[^fn2]: 无特殊需求不要启用，否则会造成[移动设备异常耗电问题](https://github.com/vernesong/OpenClash/issues/2614)。

## Clash Verge 系 （含FlClash）

直接复制粘贴到覆写规则（无法自动更新）。

### 关于各 Mihomo 客户端覆盖 GeoIP/GeoSite 下载地址的说明

如果你的客户端使用的是 `MetaCubeX/meta-rules-dat` 的 GeoIP/GeoSite 数据库，则大多数情况下不用替换，因为 `MetaCubeX/meta-rules-dat` 的 GeoIP/GeoSite 数据库已包含 `Loyalsoldier/v2ray-rules-dat` 的 GeoIP/GeoSite 数据库。

当然，为了获得更好的分流体验，建议手动修改客户端内的覆写设置。以 Mihomo Party 为例，点击侧栏中的「外部资源」，分别将资源链接替换为以下值：

| 项目           | 链接                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| GeoIP 数据库   | `https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat`   |
| GeoSite 数据库 | `https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat` |
| MMDB 数据库    | `https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb`          |
| ASN 数据库     | `https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb`     |

以下为原文，不推荐使用原文给出的数据库：

>本覆写规则大量引用了 `Loyalsoldier/v2ray-rules-dat`，大多数 Mihomo 客户端都会覆写 GeoIP/GeoSite 数据库资源链接，为了获得更好的分流体验，建议手动修改客户端内的覆写设置。以 Mihomo Party 为例，点击侧栏中的「外部资源」，分别将资源链接替换为以下值：
>
>
>
>| 项目           | 链接                                                                           |
>| -------------- | ------------------------------------------------------------------------------ |
>| GeoIP 数据库   | `https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat`   |
>| GeoSite 数据库 | `https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat` |
>| MMDB 数据库    | `https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb`          |
>| ASN 数据库     | `https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb`     |

### 关于部分特殊代理组的说明

**静态资源**：这代理组包含所有常见静态资源 CDN 域名、对象存储域名。大部分网站的静态资源（如图片、视频、音频、字体、JS、CSS）都有独立域名、不设置风控措施、不设置鉴权，这些静态资源可以使用 IP 不一定干净（例如 IDC 类 IP）、但是带宽更大、延时更低、而且有和大部分主流 CDN（如 Cloudflare、Akamai、Fastly、EdgeCast）在 IXP 有互联的网络出口。一般就实践经验来看，在正常上网中这部分域名产生的流量占据约 70% 左右。如果你在使用商业性质的远端策略服务提供商、且该服务上提供了低倍率节点，你可以将这部分域名分流至低倍率节点以节省流量。[^fn1]

[^fn1]: 来源：[我有特别的 Surge 配置和使用技巧](https://blog.skk.moe/post/i-have-my-unique-surge-setup/)

**搜狗输入**：这代理组默认放行，作用是避免搜狗输入法将你输入的每一个字符自动收集并通过`get.sogou.com/q`等域名回传。隐私担忧者可以将其设置为`REJECT`，开启后会影响搜狗输入法账号同步、词库更新、问题反馈，但语音输入等其他功能可以正常使用。

**Play 商店修复**：这代理组用于修复国行设备因使用`services.googleapis.cn`域名导致的 Google Play 下载应用时的「等待中…」问题，如果使用默认的「全球直连」问题依旧，则将其切换到「节点选择」即可。使用「全球直连」代理组时，Play 商店会从国内的 CDN 下载内容。详见：[「Google Play 商店的国内 CDN：从密码学入门到分流策略优化」](https://blog.l3zc.com/2025/03/chinese-cdn-used-by-playstore/)。

**Steam 修复**： 这代理组用于让 Steam 客户端调用国内 CDN 及 P2P 网络下载，节省大量流量。如果需要代理 Steam 所有的下载请求，将其设置为「节点选择」即可。

### 关于链式代理的说明

若有链式代理需求，可以使用`landing=true`参数，或者使用`override_with_landing.yaml`和`override_loadbalance_landing.yaml`。会新增「落地资源」和「前置代理」两个代理组，其中「落地资源」代理组会自动匹配名称包含「家宽」、「商宽」和「落地」的节点，并且其他诸如「香港节点」的代理组会自动剔除落地节点。需要被链式代理的落地节点配置需要将`dialer-proxy`字段设置为「前置代理」，以下是一个例子：

```yaml
proxies:
  - name: '香港 HGC NAT 商宽落地'
    type: ss
    server: example.com
    port: 6666
    cipher: aes-256-gcm
    password: goodpassword
    dialer-proxy: "前置代理"
```

## 特别鸣谢

[powerfullz 的覆写规则仓库](https://github.com/powerfullz/override-rules)

[mihomo-party-org/override-hub](https://github.com/mihomo-party-org/override-hub)

[我有特别的 Surge 配置和使用技巧](https://blog.skk.moe/post/i-have-my-unique-surge-setup/)

[SukkaW/Surge](https://github.com/SukkaW/Surge)