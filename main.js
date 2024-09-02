async function getSpriteData() {
    const url = `${window.location.href}sprite.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function makeThumbs() {
    const spriteData = await getSpriteData();

    const sprite = `${window.location.href}sprite.jpg`;
    const total = spriteData.thumbnail_count ?? 0;
    const width = spriteData.thumbnail_width ?? 0;
    const height = spriteData.thumbnail_height ?? 0;
    const columns = spriteData.cols ?? 0;
    const timeInterval = spriteData.time_interval ?? 0;

    return CptClapprPlugins.Plugins.Thumbnails.buildSpriteConfig(sprite, total, width, height, columns, timeInterval);
}

async function player() {
    // veja custom-serve-plugin.js
    const videoUrl = `${window.location.href}webvtt-player.mp4`;

    const playerElement = document.getElementById("player-wrapper")

    const clappr_plugins = Object.values(ClapprPlugins.Plugins);
    const cpt_plugins = Object.values(CptClapprPlugins.Plugins);

    player = new Clappr.Player({
        source: videoUrl,
        poster: `${window.location.href}poster.png`,
        mute: false,
        autoPlay: false,
        width: 640,
        height: 360,
        events: {
            // disable click to pause
            // https://github.com/clappr/clappr/issues/1818#issuecomment-506439680
            onReady: function() {
                if (Clappr.Browser.isMobile) {
                    var plugin = this.getPlugin('click_to_pause');
                    plugin && plugin.disable();
                }
            },
        },
        plugins: [...cpt_plugins, ...clappr_plugins, ],
        playback: {
            externalTracks:[
                {
                    kind: 'subtitles',
                    label: 'Português',
                    lang: 'pt-BR',
                    src: `${window.location.href}webvtt-player-pt.vtt`,
                },
                {
                    kind: 'subtitles',
                    label: 'Inglês',
                    lang: 'en-US', // https://github.com/clappr/clappr-core/blob/3126c3a38a6eee9d5aba3918b194e6380fa1178c/src/plugins/strings/strings.js#L132C21-L132C26
                    src: `${window.location.href}webvtt-player-en.vtt`,
                }
            ]
        },
        closedCaptionsConfig: {
            title: 'Legendas',
            ariaLabel: 'Closed Captions',
            // labelCallback: function (track) { return track.name },
        },
        Thumbnails: {
            backdropHeight: 64,
            spotlightHeight: 84,
            thumbs: await makeThumbs()
        },
        Transcription: {
            PanelRenderContainer: document.getElementById("transcription-container"),
            OnTranscriptionActivatedCallback: (active) => console.log("Transcription activated " + active),
        },
        SeekBarTouchFix: {
            PlayerWrapper: playerElement
        }
    });

    player.attachTo(playerElement);
}

document.addEventListener("DOMContentLoaded", async function(event) {
    await player();
});