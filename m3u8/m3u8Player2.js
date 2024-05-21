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
        const data = await this.parseM3U8(url);
        if (data.hasOwnProperty('segments')) {
            const m3u8Blob = new Blob([url], { type: 'application/x-mpegURL' });
            const m3u8Url = URL.createObjectURL(m3u8Blob);
            console.log("🚀 ~ m3u8Player ~ getSource ~ m3u8Url:", m3u8Url)
            return {
                url: m3u8Url,
                type: 'hls'
            }
        }

        const playlists = data?.playlists;
        if (!playlists || playlists.length === 0) {
            throw new Error('播放列表为空');
        }
        playlists.reverse();
        const quality = playlists.map(item => {
            return {
                name: `${item.attributes.hasOwnProperty('RESOLU') ? item.attributes.RESOLU : item.attributes.RESOLUTION.width}P`,
                url: item.uri,
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
        parser.push(uri);
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