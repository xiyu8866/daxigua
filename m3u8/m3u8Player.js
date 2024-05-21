'use strict'

class m3u8Player {
    /**
     * m3u8播放器
     * @param {DocumentElement} container 播放容器
     * @param {Function} quality_change 清晰度切换回调
     * @param {string} url m3u8地址
     */
    constructor(container, quality_change, url) {
        if (!container) {
            throw new Error('请提供有效的播放容器');
        }
        this.container = container
        this.quality_change = quality_change

        if (url) {
            this.render(url)
        }
    }

    async render(url) {
        if (!url) return;
        let video = await this.getSource(url);
        this.rendering(video)
        this.quality_change && this.quality_change(video.hasOwnProperty('quality') ? video.quality[0] : video)
        return video;
    }

    rendering(video) {
        this.player = new DPlayer({
            container: this.container,
            screenshot: true,
            autoplay: true,
            preload: 'auto',
            video: Object.assign({}, video)
        })
        if (this.quality_change) {
            this.player.on('quality_start', e => {
                this.quality_change(e)
            })
        }
    }

    async getSource(url) {
        const urlA = new URL(url);
        const { playlists } = await this.parseM3U8(url);
        if (!playlists?.length) {
            return {
                url: url,
                type: this.getType(url)
            }
        }

        let isCCTV = url.indexOf('cntv') > -1;
        if (isCCTV) {
            let temp = Object.assign({}, playlists[0], { 
                uri: playlists[0].uri.replaceAll('450', '2000'), 
                attributes: {
                    "RESOLUTION": {
                        "width": 1920,
                        "height": 1080
                    },
                    "BANDWIDTH": 2048000,
                    "PROGRAM-ID": 1
                }
            });
            playlists.push(temp)
        }
        playlists.reverse();
        const quality = playlists.map(item => {
            return {
                name: `${item.attributes.hasOwnProperty('RESOLU') ? item.attributes.RESOLU : item.attributes.RESOLUTION.width}P`,
                url: item.uri.indexOf('http') !== 0 ? urlA.origin + item.uri : item.uri,
                type: this.getType(item.uri)
            }
        });
        return {
            quality: quality,
            defaultQuality: 0
        }
    }

    async parseM3U8(uri) {
        const parser = new m3u8Parser.Parser();
        const manifest = await fetch(uri).then(resp => resp.text());
        if (manifest == '') {
            alert('无效的m3u8地址');
            return false;
        }
        parser.push(manifest);
        parser.end();
        return parser.manifest;
    }

    getType(url) {
        if (url.indexOf('m3u8') > -1) {
            return 'hls';
        } else {
            return 'normal';
        }
    }
}