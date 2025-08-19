/*
powerfullz 的 Substore 订阅转换脚本
https://github.com/powerfullz/override-rules
传入参数：
- loadbalance: 启用负载均衡 (默认false)
- landing: 启用落地节点功能 (默认false)
- ipv6: 启用 IPv6 支持 (默认false)
- full: 启用完整配置，用于纯内核启动 (默认false)
- keepalive: 启用 tcp-keep-alive (默认false)
*/

const inArg = { loadBalance: true }; // console.log(inArg)
const loadBalance = parseBool(inArg.loadbalance) || false,
    landing = parseBool(inArg.landing) || false,
    ipv6Enabled = parseBool(inArg.ipv6) || false,
    fullConfig = parseBool(inArg.full) || false,
    keepAliveEnabled = parseBool(inArg.keepalive) || false;

function buildBaseLists({ landing, lowCost, countryInfo }) {
    const countryGroupNames = countryInfo
        .filter(item => item.count > 2)
        .map(item => item.country + "节点");

    // defaultSelector (节点选择 组里展示的候选) 
    // 故障转移, 落地节点(可选), 各地区节点, 低倍率节点(可选), 手动切换, DIRECT
    const selector = ["故障转移"]; // 把 fallback 放在最前
    if (landing) selector.push("落地节点");
    selector.push(...countryGroupNames);
    if (lowCost) selector.push("低倍率节点");
    selector.push("手动切换", "DIRECT");

    // defaultProxies (各分类策略引用) 
    // 节点选择, 各地区节点, 低倍率节点(可选), 手动切换, 全球直连
    const defaultProxies = ["节点选择", ...countryGroupNames];
    if (lowCost) defaultProxies.push("低倍率节点");
    defaultProxies.push("手动切换", "全球直连");

    // direct 优先的列表
    const defaultProxiesDirect = ["全球直连", ...countryGroupNames, "节点选择", "手动切换"]; // 直连优先
    if (lowCost) {
        // 在直连策略里低倍率次于地区、早于节点选择
        defaultProxiesDirect.splice(1 + countryGroupNames.length, 0, "低倍率节点");
    }

    const defaultFallback = [];
    if (landing) defaultFallback.push("落地节点");
    defaultFallback.push(...countryGroupNames);
    if (lowCost) defaultFallback.push("低倍率节点");
    // 可选是否加入 手动切换 / DIRECT；按容灾语义加入。
    defaultFallback.push("手动切换", "DIRECT");

    return { defaultProxies, defaultProxiesDirect, defaultSelector: selector, defaultFallback, countryGroupNames };
}

const ruleProviders = {
    "ADBlock": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://adrules.top/adrules_domainset.txt",
        "path": "./ruleset/ADBlock.txt"
    },
    "SogouInput": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/sogouinput.txt",
        "path": "./ruleset/SogouInput.txt"
    },
    "StaticResources": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/domainset/cdn.txt",
        "path": "./ruleset/StaticResources.txt"
    },
    "CDNResources": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/cdn.txt",
        "path": "./ruleset/CDNResources.txt"
    },
    "AI": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/non_ip/ai.txt",
        "path": "./ruleset/AI.txt"
    },
    "TikTok": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/TikTok.list",
        "path": "./ruleset/TikTok.list"
    },
    "EHentai": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/EHentai.list",
        "path": "./ruleset/EHentai.list"
    },
    "FurryBar": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/FurryBar.list",
        "path": "./ruleset/EHentai.list"
    },
    "SteamFix": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/SteamFix.list",
        "path": "./ruleset/SteamFix.list"
    },
    "GoogleFCM": {
        "type": "http", "behavior": "classical", "interval": 86400, "format": "text",
        "path": "./ruleset/FirebaseCloudMessaging.list",
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/FirebaseCloudMessaging.list",
    },
    "AdditionalFilter": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/AdditionalFilter.list",
        "path": "./ruleset/AdditionalFilter.list"
    },
    "Weibo": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/Weibo.list",
        "path": "./ruleset/Weibo.list"
    },
    "AdditionalCDNResources": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/RuleSet/AdditionalCDNResources.list",
        "path": "./ruleset/AdditionalCDNResources.list"
    },
    "SpeedTest": {
        "type": "http", "behavior": "domain", "format": "text", "interval": 86400,
        "url": "https://ruleset.skk.moe/Clash/domainset/speedtest.txt",
        "path": "./ruleset/SpeedTest.list"
    },

}

const rules = [
    "RULE-SET,ADBlock,广告拦截",
    "RULE-SET,AdditionalFilter,广告拦截",
    "RULE-SET,SogouInput,搜狗输入",
    "RULE-SET,StaticResources,静态资源",
    "RULE-SET,CDNResources,静态资源",
    "RULE-SET,AdditionalCDNResources,静态资源",
    "RULE-SET,AI,人工智能",
    "RULE-SET,EHentai,E-Hentai",
    "RULE-SET,FurryBar,PornSite",
    "RULE-SET,TikTok,TikTok",
    "RULE-SET,SteamFix,Steam修复",
    "RULE-SET,GoogleFCM,FCM推送",
    "RULE-SET,Weibo,新浪微博",
    "RULE-SET,SpeedTest,测速服务",
    "DOMAIN,services.googleapis.cn,Play商店修复",
    "GEOSITE,GOOGLE-PLAY@CN,全球直连",
    "GEOSITE,APPLE@CN,全球直连",
    "GEOSITE,APPLE,Apple",
    "GEOSITE,TELEGRAM,Telegram",
    "GEOSITE,YOUTUBE@CN,全球直连",
    "GEOSITE,YOUTUBE,YouTube",
    "GEOSITE,GOOGLE,Google",
    "GEOSITE,NETFLIX,Netflix",
    "GEOSITE,SPOTIFY,Spotify",
    "GEOSITE,TWITTER,Twitter(X)",
    "GEOSITE,BAHAMUT,巴哈姆特",
    "GEOSITE,BILIBILI,哔哩哔哩",
    "GEOSITE,CATEGORY-DEV,开发者资源",
    "GEOSITE,CATEGORY-PORN,PornSite",
    "GEOSITE,CATEGORY-GAMES@CN,全球直连",
    "GEOSITE,CATEGORY-GAMES,游戏平台",
    "GEOSITE,CATEGORY-SCHOLAR-!CN,学术资源",
    "GEOSITE,CATEGORY-SCHOLAR-CN,全球直连",
    "GEOSITE,CATEGORY-CRYPTOCURRENCY,加密货币",
    "GEOSITE,MICROSOFT@CN,全球直连",
    "GEOSITE,MICROSOFT,Microsoft",
    "GEOSITE,GFW,节点选择",
    "GEOSITE,CN,全球直连",
    "GEOSITE,PRIVATE,全球直连",
    "GEOIP,NETFLIX,Netflix,no-resolve",
    "GEOIP,GOOGLE,Google,no-resolve",
    "GEOIP,TELEGRAM,Telegram,no-resolve",
    "GEOIP,CN,全球直连",
    "GEOIP,PRIVATE,全球直连",
    "DST-PORT,22,SSH(22端口)",
    "MATCH,节点选择"
];

const snifferConfig = {
    "sniff": {
        "TLS": {
            "ports": [443, 8443],
        },
        "HTTP": {
            "ports": [80, 8080, 8880],
        },
        "QUIC": {
            "ports": [443, 8443],
        }
    },
    "override-destination": false,
    "enable": true,
    "force-dns-mapping": true,
    "skip-domain": [
        "Mijia Cloud",
        "dlg.io.mi.com",
        "+.push.apple.com"
    ]
};

const dnsConfig = {
    "enable": true,
    "ipv6": ipv6Enabled,
    "prefer-h3": true,
    "enhanced-mode": "redir-host",
    "default-nameserver": [
        "119.28.28.28",
        "119.29.29.29",
        "223.5.5.5",
        "223.6.6.6",
    ],
    "nameserver": [
        "system",
        "119.29.29.29",
        "223.5.5.5",
        "quic://223.5.5.5",
        "tls://dot.pub:853",
        "tls://dns.alidns.com:853",
        "https://dot.pub:443/dns-query",
        "https://dns.alidns.com:443/dns-query",
    ],
    "fallback": [
        "quic://dns0.eu",
        "https://dns.cloudflare.com/dns-query",
        "https://dns.sb/dns-query",
        "tcp://208.67.222.222",
        "tcp://8.26.56.2"
    ],
    "proxy-server-nameserver": [
        "quic://223.5.5.5",
        "tls://dot.pub",
    ]
};

const geoxURL = {
    "geoip": "https://cdn.jsdmirror.com/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
    "geosite": "https://cdn.jsdmirror.com/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
    "mmdb": "https://cdn.jsdmirror.com/gh/Loyalsoldier/geoip@release/Country.mmdb",
    "asn": "https://cdn.jsdmirror.com/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
};

// 地区元数据
const countriesMeta = {
    "香港": {
    pattern: "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|🇭🇰",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png"
    },
    "台湾": {
    pattern: "(?i)台|新北|彰化|TW|Taiwan|🇹🇼",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png"
    },
    "新加坡": {
    pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Singapore.png"
    },
    "日本": {
    pattern: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan|🇯🇵",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Japan.png"
    },
    "美国": {
    pattern: "(?i)美国|美|US|United States|🇺🇸",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/United_States.png"
    },
    "其他节点": {
    pattern: "(?i).+",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Global.png"
    },
};

function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return false;
}

function hasLowCost(config) {
    // 检查是否有低倍率节点
    const proxies = config["proxies"];
    const lowCostRegex = new RegExp(/0\.[0-5]|低倍率|省流|大流量|实验性/, 'i');
    for (const proxy of proxies) {
        if (lowCostRegex.test(proxy.name)) {
            return true;
        }
    }
    return false;
}

function parseCountries(config) {
    const proxies = config.proxies || [];
    const ispRegex = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;   // 需要排除的关键字

    // 用来累计各国节点数
    const countryCounts = Object.create(null);

    // 构建地区正则表达式，去掉 (?i) 前缀
    const compiledRegex = {};
    for (const [country, meta] of Object.entries(countriesMeta)) {
        compiledRegex[country] = new RegExp(
            meta.pattern.replace(/^\(\?i\)/, ''),
            'i'
        );
    }

    // 逐个节点进行匹配与统计
    for (const proxy of proxies) {
        const name = proxy.name || '';

        // 过滤掉不想统计的 ISP 节点
        if (ispRegex.test(name)) continue;

        // 标记是否匹配到主要国家
        let matched = false;
        const mainCountries = ["香港", "台湾", "新加坡", "日本", "美国"];
        
        // 优先匹配主要国家
        for (const country of mainCountries) {
            if (compiledRegex[country] && compiledRegex[country].test(name)) {
                countryCounts[country] = (countryCounts[country] || 0) + 1;
                matched = true;
                break;
            }
        }
        
        // 如果没有匹配到主要国家，则归入其他节点类
        if (!matched) {
            countryCounts["其他节点"] = (countryCounts["其他节点"] || 0) + 1;
        }
    }

    // 将结果对象转成数组形式
    const result = [];
    for (const [country, count] of Object.entries(countryCounts)) {
        result.push({ country, count });
    }

    return result;   // [{ country: 'Japan', count: 12 }, ...]
}


function buildCountryProxyGroups(countryList) {
    // 获取实际存在的地区列表
    const countryProxyGroups = [];

    // 为实际存在的地区创建节点组
    for (const country of countryList) {
        // 确保地区名称在预设的地区配置中存在
        if (countriesMeta[country]) {
            const groupName = `${country}节点`;
            const pattern = countriesMeta[country].pattern;

            const groupConfig = {
                "name": groupName,
                "icon": countriesMeta[country].icon,
                "include-all": true,
                "filter": pattern,
                "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地|0\.[0-5]|低倍率|省流|大流量|实验性",
                "type": (loadBalance) ? "load-balance" : "url-test",
            };

            if (!loadBalance) {
                Object.assign(groupConfig, {
                    "url": "https://cp.cloudflare.com/generate_204",
                    "interval": 180,
                    "tolerance": 20,
                    "lazy": false
                });
            }

            countryProxyGroups.push(groupConfig);
        }
    }

    return countryProxyGroups;
}

function buildProxyGroups({
    countryList,
    countryProxyGroups,
    lowCost,
    defaultProxies,
    defaultProxiesDirect,
    defaultSelector,
    defaultFallback
}) {
    // 查看是否有特定地区的节点
    const hasTW = countryList.includes("台湾");
    const hasHK = countryList.includes("香港");
    const hasUS = countryList.includes("美国");
    // 排除落地节点、节点选择和故障转移以避免死循环
    const frontProxySelector = [
        ...defaultSelector.filter(name => name !== "落地节点" && name !== "故障转移")
    ];

    return [
        {
            "name": "节点选择",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
            "type": "select",
            "proxies": defaultSelector
        },
        {
            "name": "手动切换",
            "icon": "https://cdn.jsdmirror.com/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
            "include-all": true,
            "type": "select"
        },
        (landing) ? {
            "name": "前置代理",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Area.png",
            "type": "select",
            "include-all": true,
            "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
            "proxies": frontProxySelector
        } : null,
        (landing) ? {
            "name": "落地节点",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Airport.png",
            "type": "select",
            "include-all": true,
            "filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
        } : null,
        {
            "name": "故障转移",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Bypass.png",
            "type": "fallback",
            "url": "https://cp.cloudflare.com/generate_204",
            "proxies": defaultFallback,
            "interval": 180,
            "tolerance": 20,
            "lazy": false
        },
        {
            "name": "静态资源",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png",
            "type": "select",
            "proxies": defaultProxies,
        },
        {
            "name": "人工智能",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Bot.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "加密货币",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Cryptocurrency_3.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Telegram",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Telegram.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Microsoft",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png",
            "type": "select",
            "proxies": defaultProxies,
        },
        {
            "name": "Apple",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Apple_2.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Google",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "YouTube",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Netflix",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Spotify",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Spotify.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "TikTok",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/TikTok.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "E-Hentai",
            "icon": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/Icons/Ehentai.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "巴哈姆特",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png",
            "type": "select",
            "proxies": (hasTW) ? ["台湾节点", "节点选择", "手动切换", "全球直连"] : defaultProxies
        },
        {
            "name": "哔哩哔哩",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/bilibili.png",
            "type": "select",
            "proxies": (hasTW && hasHK) ? ["全球直连", "台湾节点", "香港节点"] : defaultProxiesDirect
        },
        {
            "name": "Twitter(X)",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Twitter.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "新浪微博",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Weibo.png",
            "type": "select",
            "include-all": true,
            "proxies": defaultProxiesDirect
        },
        {
            "name": "学术资源",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Scholar.png",
            "type": "select",
            "proxies": [
                "节点选择", "手动切换", "全球直连"
            ]
        },
        {
            "name": "开发者资源",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/GitHub.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "PornSite",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Pornhub.png",
            "type": "select",
            "proxies": defaultProxies,
        },
        {
            "name": "游戏平台",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Game.png",
            "type": "select",
            "proxies": defaultProxies,
        },
        {
            "name": "测速服务",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Speedtest.png",
            "type": "select",
            "proxies": defaultProxies,
        },
        {
            "name": "FCM推送",
            "icon": "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
            "type": "select",
            "proxies": [
                "全球直连", "Google", "节点选择"
            ]
        },
        {
            "name": "SSH(22端口)",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Server.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Steam修复",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Steam.png",
            "type": "select",
            "proxies": [
                "全球直连", "游戏平台", "节点选择"
            ]
        },
        {
            "name": "Play商店修复",
            "icon": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/Icons/GooglePlay.png",
            "type": "select",
            "proxies": [
                "全球直连", "Google", "节点选择"
            ]
        },
        {
            "name": "搜狗输入",
            "icon": "https://cdn.jsdmirror.com/gh/PianCat/OverrideRuleset@master/Icons/Sougou.png",
            "type": "select",
            "proxies": [
                "REJECT", "全球直连"
            ]
        },
        {
            "name": "全球直连",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
            "type": "select",
            "proxies": [
                "DIRECT", "节点选择"
            ]
        },
        {
            "name": "广告拦截",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png",
            "type": "select",
            "proxies": [
                "REJECT", "全球直连"
            ]
        },
        (lowCost) ? {
            "name": "低倍率节点",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Lab.png",
            "type": "url-test",
            "url": "https://cp.cloudflare.com/generate_204",
            "include-all": true,
            "filter": "(?i)0\.[0-5]|低倍率|省流|大流量|实验性"
        } : null,
        ...countryProxyGroups
    ].filter(Boolean); // 过滤掉 null 值
}

function main(config) {
    // 解析地区与低倍率信息
    const countryInfo = parseCountries(config); // [{ country, count }]
    const lowCost = hasLowCost(config);

    // 构建基础数组
    const {
        defaultProxies,
        defaultProxiesDirect,
        defaultSelector,
        defaultFallback,
        countryGroupNames: targetCountryList
    } = buildBaseLists({ landing, lowCost, countryInfo });

    // 为地区构建对应的 url-test / load-balance 组
    const countryProxyGroups = buildCountryProxyGroups(targetCountryList.map(n => n.replace(/节点$/, '')));

    // 生成代理组
    const proxyGroups = buildProxyGroups({
        countryList: targetCountryList.map(n => n.replace(/节点$/, '')),
        countryProxyGroups,
        lowCost,
        defaultProxies,
        defaultProxiesDirect,
        defaultSelector,
        defaultFallback
    });
    const globalProxies = proxyGroups.map(item => item.name);
    
    proxyGroups.push(
        {
            "name": "GLOBAL",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Global.png",
            "include-all": true,
            "type": "select",
            "proxies": globalProxies
        }
    );

    if (fullConfig) Object.assign(config, {
        "mixed-port": 7890,
        "redir-port": 7892,
        "tproxy-port": 7893,
        "routing-mark": 7894,
        "allow-lan": true,
        "ipv6": ipv6Enabled,
        "mode": "rule",
        "unified-delay": true,
        "tcp-concurrent": true,
        "find-process-mode": "off",
        "log-level": "info",
        "geodata-loader": "standard",
        "external-controller": ":9999",
        "disable-keep-alive": !keepAliveEnabled,
        "profile": {
            "store-selected": true,
        }
    });

    Object.assign(config, {
        "proxy-groups": proxyGroups,
        "rule-providers": ruleProviders,
        "rules": rules,
        "sniffer": snifferConfig,
        "dns": dnsConfig,
        "geodata-mode": true,
        "geox-url": geoxURL,
    });

    return config;
}